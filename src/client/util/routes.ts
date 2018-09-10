export const routes: RouteList = {
  data: [],
  get(key: string, defaultValue: any = '') {
    let item = this.data.find(d => d.name == key)
    return item && item.path || defaultValue
  },
  is(key: string) {
    let path = window.location.pathname
    return !!this.data.find(i => i.name == key && i.path == path)
  },
  when(key: string, truthy: any = '', falsy: any = '') {
    let path = window.location.pathname
    return !!this.data.find(i => i.name == key && i.path == path) ? truthy : falsy
  }
}