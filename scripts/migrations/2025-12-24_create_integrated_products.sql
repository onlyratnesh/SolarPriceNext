-- Migration: create integrated_products table
-- Run this in Supabase SQL editor or as a migration

CREATE TABLE public.integrated_products (
  id serial PRIMARY KEY,
  brand varchar(50) NOT NULL,
  system_kw numeric(5,2) NOT NULL,
  phase varchar(10) NOT NULL,
  price numeric(12,2) NOT NULL,
  inverter_capacity_kw numeric(5,2) NOT NULL,
  module_watt integer NOT NULL,
  module_type varchar(50) DEFAULT 'TopCon',
  no_of_modules integer NOT NULL,
  acdb_nos integer NOT NULL DEFAULT 1,
  dcdb_nos integer NOT NULL DEFAULT 1,
  earthing_rod_nos integer NOT NULL DEFAULT 3,
  earthing_chemical_nos integer NOT NULL DEFAULT 3,
  ac_wire_brand varchar(50) DEFAULT 'Polycab',
  ac_wire_length_mtr integer NOT NULL DEFAULT 10,
  dc_wire_brand varchar(50) DEFAULT 'Polycab',
  dc_wire_length_mtr integer NOT NULL DEFAULT 20,
  earthing_wire_brand varchar(50) DEFAULT 'AL Wire',
  earthing_wire_length_mtr integer NOT NULL DEFAULT 90,
  lighting_arrestor_qty integer NOT NULL DEFAULT 1,
  created_at timestamp without time zone DEFAULT now()
);
