"use client";

import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { GroupStatusEvent } from "@/@types";
import { SOCKET_URL } from "@/lib/constants";
import { getAccessToken } from "@/request/token";

type Handlers = {
  // Admin boshladi / test yakunlandi / bekor qilindi — holat qayta olinadi
  onStatus: (event: GroupStatusEvent) => void;
  onKicked: () => void;
  // Shu akkaunt bilan test boshqa qurilmada ochildi (bitta akkaunt — bitta ulanish)
  onReplaced: () => void;
  // Server tokenni qabul qilmadi: holat so'rovi 401 bo'lsa axios tokenni yangilaydi, keyin qayta ulanamiz
  onUnauthorized: () => Promise<unknown>;
  // Tarmoq uzilib qayta ulangach — shu orada o'tkazib yuborilgan hodisalar o'rniga holat qayta olinadi
  onReconnect: () => void;
};

// Jamoaviy test real vaqt kanali: socket.io, namespace /group-tests. Faqat qatnashchi bo'lganda (enabled) ulanadi.
// Token har ulanishda cookie'dan o'qiladi — access token yangilangan bo'lsa qayta ulanish yangisi bilan ketadi
export const useGroupTestSocket = (testId: string, enabled: boolean, handlers: Handlers) => {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  // Oxirgi ochilgan savol: qayta ulangach adminga yana yuboriladi
  const viewingRef = useRef<number | null>(null);

  const onStatus = useEffectEvent((event: GroupStatusEvent) => handlers.onStatus(event));
  const onKicked = useEffectEvent(() => handlers.onKicked());
  const onReplaced = useEffectEvent(() => handlers.onReplaced());
  const onUnauthorized = useEffectEvent(() => handlers.onUnauthorized());
  const onReconnect = useEffectEvent(() => handlers.onReconnect());

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let first = true;
    let usedToken: string | undefined;

    const socket = io(`${SOCKET_URL}/group-tests`, {
      transports: ["websocket"],
      auth: (cb) => {
        usedToken = getAccessToken();
        cb({ token: usedToken ?? "", testId, as: "user" });
      },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      if (viewingRef.current !== null) socket.emit("viewing", { questionId: viewingRef.current });
      if (!first) onReconnect();
      first = false;
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("status", (event: GroupStatusEvent) => onStatus(event));
    // Lobbyga kimdir qo'shildi/chiqdi — qatnashchilar soni uchun holat qayta olinadi
    socket.on("participants", () => onReconnect());

    // Server ulanishni o'zi uzadi — qayta ulanmaymiz
    const stop = (handler: () => void) => () => {
      active = false;
      socket.disconnect();
      handler();
    };
    socket.on("kicked", stop(onKicked));
    socket.on("replaced", stop(onReplaced));

    socket.on("unauthorized", async () => {
      const before = usedToken;
      await onUnauthorized().catch(() => undefined);
      const token = getAccessToken();
      // Faqat token haqiqatan yangilangan bo'lsa (aks holda cheksiz aylanib qoladi)
      if (active && token && token !== before) socket.connect();
    });

    return () => {
      active = false;
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [testId, enabled]);

  // O'quvchi savolni ochdi — admin jadvalida yonib turadi
  const emitViewing = useCallback((questionId: number) => {
    viewingRef.current = questionId;
    const socket = socketRef.current;
    if (socket?.connected) socket.emit("viewing", { questionId });
  }, []);

  return { connected, emitViewing };
};
