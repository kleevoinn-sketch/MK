import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { getPolicy } from '@/data/policies'

export const Route = createFileRoute('/policies/$slug')({
  loader: ({ params }) => {
    const policy = getPolicy(params.slug)
    if (!policy) throw notFound()
    return policy
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? 'Policy'} | KLEEVO` },
      { name: 'description', content: loaderData?.description ?? '' },
      { property: 'og:title', content: `${loaderData?.title ?? 'Policy'} | KLEEVO` },
    ],
  }),
  component: PolicyPage,
})

function PolicyPage() {
  const policy = Route.useLoaderData()
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <nav className="mb-4 text-sm text-gray-500"><Link to="/" className="hover:underline">Home</Link> / {policy.title}</nav>
      <h1 className="text-3xl font-extrabold">{policy.title}</h1>
      {policy.sections.map((s) => (
        <section key={s.h} className="mt-6">
          <h2 className="text-lg font-bold">{s.h}</h2>
          {s.p.map((t, i) => <p key={i} className="mt-2 leading-relaxed text-gray-700">{t}</p>)}
        </section>
      ))}
    </article>
  )
}
