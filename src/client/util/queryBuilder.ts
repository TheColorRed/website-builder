export class QueryBuilder {

  public constructor(private params: { key: string, value: string }[] = []) { }

  public static create() {
    return new QueryBuilder(QueryBuilder.parse(window.location.search))
  }

  public static parse(search: string) {
    return search.replace(/^\?/, '').split('&').map(i => {
      let [key, value] = i.split('=', 2)
      return { key: key, value: value }
    }).filter(i => i.key.length > 0)
  }

  public update() {
    this.params = QueryBuilder.parse(window.location.search)
  }

  public set(key: string, value: string) {
    if (key.length == 0) return
    let item = this.params.find(i => i.key == key)
    if (item) { item.value = value }
    else this.params.push({ key, value })
  }

  public get(key: string, defaultValue = '') {
    let itm = this.params.find(i => i.key == key)
    return itm ? itm.value : defaultValue
  }

  public remove(...keys: string[]) {
    keys.forEach(key => {
      let idx = this.params.findIndex(i => i.key == key)
      idx > -1 && this.params.splice(idx, 1)
    })
  }

  public toString() {
    if (this.params.length == 0) return ''
    return '?' + this.params.map(i => i.key + '=' + i.value).join('&')
  }
}