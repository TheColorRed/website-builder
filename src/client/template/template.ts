export interface ElementMap {
  div: any
  span: any
}

export type TemplateTool = {
  [key in keyof ElementMap]?: TemplateTool | string | number
}

export class Template {
  public constructor(private el: TemplateTool | TemplateTool[]) {

  }

}

new Template([
  { div: 'sdf' }
])