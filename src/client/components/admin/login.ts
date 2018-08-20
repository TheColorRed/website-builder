namespace builder {
  interface login {
    error: boolean
    message: string
  }
  export function adminLogin(data: login) {
    console.log(data)
  }
}