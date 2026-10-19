import { useQuery } from '@tanstack/react-query';

export function ProjectStatus({ loadStatus }) {
  const status = useQuery({
    queryKey: ['project-status'],
    queryFn: ({ signal }) => loadStatus(signal),
    retry: false,
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-red-400">
        Flamengo Analytics
      </p>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Análise individual. Recorte preciso.
      </h1>
      {status.isPending && (
        <p role="status" className="mt-8 text-neutral-300">
          Carregando informações do projeto…
        </p>
      )}
      {status.isError && (
        <div role="alert" className="mt-8 rounded-xl border border-red-800 p-6">
          <p>Não foi possível carregar as informações do projeto.</p>
          <button
            onClick={() => status.refetch()}
            className="mt-4 rounded-md bg-red-700 px-4 py-2 font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Tentar novamente
          </button>
        </div>
      )}
      {status.isSuccess && (
        <section className="mt-8 rounded-xl border border-neutral-700 bg-neutral-900 p-6">
          <h2 className="text-lg font-semibold">{status.data.label}</h2>
          <p className="mt-4 leading-relaxed text-neutral-300">
            A fonte de dados está em homologação. As estatísticas ainda estão
            indisponíveis.
          </p>
          <p className="mt-3 text-sm text-neutral-400">
            A cobertura das partidas e dos indicadores será informada após a validação
            dos dados.
          </p>
        </section>
      )}
    </main>
  );
}
