let io = null;
export const initSocket = (serverIo) => {
  io = serverIo;
};
export const getIo = () => io;
export default { initSocket, getIo };
