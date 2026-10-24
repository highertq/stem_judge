import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

export function baseOptions(): BaseLayoutProps {
  return {
    nav: { title: 'Rubricly 文档' },
    links: [{ text: '首页', url: '/' }],
    githubUrl: 'https://github.com/highertq/stem_judge',
  }
}
