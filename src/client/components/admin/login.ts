namespace builder {
  interface login {
    error: boolean
    message: string
    location: string
  }
  export function adminLogin(data: login) {
    if (data.error) return
    window.location.href = data.location
  }
}