// import { io } from 'socket.io-client'
// import server from '../configs/server.config'


// const connectSocket = (data, navigate) => {
//     const { token, user, redirectTo } = data; 

//     const socket = io(`http://localhost:3002`, {
//         auth: { token },
//         reconnection: true
//     })

//     socket.on("connect", () => {
//         alert("Chào mừng bạn đến với TMovies")
//     })

//     socket.on("connect_error", (err) => {
//         const connectMessageError = err.message
//         alert(`Lỗi: ${connectMessageError}`)
//         socket.disconnect()
//     })

//     socket.on("userConnect", () => {
//         navigate(redirectTo, { state: {user} })
//     })
// }

// export default connectSocket