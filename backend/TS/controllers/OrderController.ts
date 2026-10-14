import type { Server as IO, Socket } from "socket.io";

type Items = {
  quantity: number;
  name: string;
};

type ReceivedOrder = {
  id: number;
  orderId: number;
  customerName: string;
  orderedAt : number;
  items: Items[];
};

export function handleReceivedOrder(socket: Socket, payload: ReceivedOrder) {
  const { orderId, customerName, orderedAt , items } = payload;

  if (!orderId) {
    console.error("Invalid order!");
    return;
  }

  //storing the info in the socket data itself
  socket.data.orderId = orderId;
  socket.data.customerName = customerName;
  socket.data.orderedAt  = orderedAt ;
  socket.data.items = items;
}
