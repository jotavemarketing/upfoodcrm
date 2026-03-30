-- Tabela de leads capturados pela landing page
create table public.leads (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text not null,
  company text not null,
  revenue_range text not null,
  status text not null default 'novo',
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index para buscas comuns
create index leads_status_idx on public.leads(status);
create index leads_created_at_idx on public.leads(created_at desc);

-- RLS
alter table public.leads enable row level security;

-- Política: permite INSERT anônimo (formulário da LP)
create policy "Permite insert anônimo" on public.leads
  for insert to anon with check (true);

-- Política: apenas usuários autenticados podem ler/atualizar
create policy "Auth pode ler leads" on public.leads
  for select to authenticated using (true);

create policy "Auth pode atualizar leads" on public.leads
  for update to authenticated using (true);

-- Trigger para atualizar updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger leads_updated_at
  before update on public.leads
  for each row execute function update_updated_at();
