import { useEffect, useState } from "react";

export default function useProximity(socket) {
  const [nearby, setNearby] = useState([]);

  useEffect(() => {
    socket.on("nearbyUsers", setNearby);
  }, [socket]);

  return { nearby };
}