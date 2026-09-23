/**
 * MDX rendering for project write-ups.
 *
 * Runs in a Server Component at build time: the MDX is compiled, code blocks
 * are highlighted by Shiki (via rehype-pretty-code), and only static HTML ships
 * to the browser. No highlighter JavaScript reaches the client.
 */
import type { ComponentProps } from "react";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";

const prettyCodeOptions: PrettyCodeOptions = {
  theme: "github-dark-default",
  // Drop the theme's background so code blocks use our own surface colour.
  keepBackground: false,
  defaultLang: "plaintext",
};

/** Element overrides available inside every MDX file. */
const components = {
  // Open external links in a new tab and keep in-site links as normal anchors.
  a: ({ href = "", ...props }: ComponentProps<"a">) =>
    href.startsWith("http") ? (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
    ) : (
      <a href={href} {...props} />
    ),
};

export async function renderMdx(source: string) {
  const { content } = await compileMDX({
    source,
    components,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
      },
    },
  });
  return content;
}
