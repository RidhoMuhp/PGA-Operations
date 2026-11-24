-- Additive staging schema for PGA Operations.
-- This does not alter or delete the legacy reports tables or their data.

begin;

create table if not exists public.operations_employees (
  employee_id text primary key,
  barcode text not null unique,
  full_name text not null,
  role text not null,
  is_test_record boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.operations_attendance_terminals (
  id text primary key,
  production_type_id text not null check (
    production_type_id in (
      'sagu',
      'tapioka-1kg',
      'tapioka-200gr',
      'tapioka-500gr',
      'tapioka-2kg',
      'maizena',
      'maizena-rk'
    )
  ),
  location text not null,
  is_active boolean not null default true,
  unique (id, production_type_id)
);

create table if not exists public.operations_attendance_records (
  id uuid primary key default gen_random_uuid(),
  employee_id text not null references public.operations_employees(employee_id),
  division_id text not null check (
    division_id in ('production', 'warehouse', 'operations', 'cleaning')
  ),
  production_type_id text check (
    production_type_id is null or production_type_id in (
      'sagu',
      'tapioka-1kg',
      'tapioka-200gr',
      'tapioka-500gr',
      'tapioka-2kg',
      'maizena',
      'maizena-rk'
    )
  ),
  terminal_id text,
  session_id text,
  work_date date not null,
  scanned_at timestamptz not null default now(),
  method text not null default 'barcode' check (method in ('barcode', 'manual')),
  reviewed_at timestamptz,
  foreign key (terminal_id, production_type_id)
    references public.operations_attendance_terminals(id, production_type_id),
  check (
    method <> 'barcode'
    or (
      division_id = 'production'
      and production_type_id is not null
      and terminal_id is not null
      and session_id is not null
    )
  )
);

create unique index if not exists operations_attendance_barcode_session_unique
  on public.operations_attendance_records (
    employee_id,
    production_type_id,
    terminal_id,
    session_id
  )
  where method = 'barcode';

create index if not exists operations_attendance_terminal_date_idx
  on public.operations_attendance_records (terminal_id, work_date, scanned_at desc);

create table if not exists public.operations_reports (
  id uuid primary key default gen_random_uuid(),
  report_number text not null unique,
  report_name text not null,
  department text not null check (
    department in ('Produksi', 'Gudang', 'Operasional', 'Kebersihan', 'Absensi')
  ),
  division_id text not null check (
    division_id in ('production', 'warehouse', 'operations', 'cleaning')
  ),
  report_type_slug text,
  production_type_id text check (
    production_type_id is null or production_type_id in (
      'sagu',
      'tapioka-1kg',
      'tapioka-200gr',
      'tapioka-500gr',
      'tapioka-2kg',
      'maizena',
      'maizena-rk'
    )
  ),
  report_date date not null,
  submitted_by text not null,
  status text not null check (
    status in (
      'draft',
      'submitted',
      'under_review',
      'revision_requested',
      'approved',
      'collected'
    )
  ),
  created_at timestamptz not null default now(),
  notes text,
  payload jsonb not null default '{}'::jsonb
);

create index if not exists operations_reports_filter_idx
  on public.operations_reports (
    division_id,
    production_type_id,
    report_date,
    status
  );

alter table public.operations_employees enable row level security;
alter table public.operations_attendance_terminals enable row level security;
alter table public.operations_attendance_records enable row level security;
alter table public.operations_reports enable row level security;

revoke all on public.operations_employees,
  public.operations_attendance_terminals,
  public.operations_attendance_records,
  public.operations_reports
  from public, anon, authenticated;

grant select, insert, update, delete on public.operations_employees,
  public.operations_attendance_terminals,
  public.operations_attendance_records,
  public.operations_reports
  to service_role;

insert into public.operations_employees (
  employee_id, barcode, full_name, role, is_test_record
)
values
  ('EMP-001', 'PGA-0001', 'Siti Rahmawati', 'Operator Produksi', false),
  ('EMP-002', 'PGA-0002', 'Budi Santoso', 'Operator Produksi', false),
  ('EMP-003', 'PGA-0003', 'Agus Prasetyo', 'Operator Produksi', false),
  ('EMP-004', 'PGA-0004', 'Dewi Lestari', 'Operator Produksi', false),
  ('EMP-005', 'PGA-0005', 'Hendra Wijaya', 'Operator Produksi', false),
  ('EMP-006', 'PGA-0006', 'Rina Marlina', 'Petugas Gudang', false),
  ('EMP-007', 'PGA-0007', 'Nur Aisyah', 'Petugas Kebersihan', false),
  ('EMP-008', 'PGA-0008', 'Pegawai Uji Coba', 'Operator Produksi', true)
on conflict do nothing;

insert into public.operations_attendance_terminals (id, production_type_id, location)
values
  ('TERM-SAGU-01', 'sagu', 'Area Produksi Sagu'),
  ('TERM-TAPIOKA-1KG-01', 'tapioka-1kg', 'Area Produksi Tapioka 1 kg'),
  ('TERM-TAPIOKA-200G-01', 'tapioka-200gr', 'Area Produksi Tapioka 200 gr'),
  ('TERM-TAPIOKA-500G-01', 'tapioka-500gr', 'Area Produksi Tapioka 500 gr'),
  ('TERM-TAPIOKA-2KG-01', 'tapioka-2kg', 'Area Produksi Tapioka 2 kg'),
  ('TERM-MAIZENA-01', 'maizena', 'Area Produksi Maizena'),
  ('TERM-MAIZENA-RK-01', 'maizena-rk', 'Area Produksi Maizena RK')
on conflict (id) do nothing;

commit;
