-- LGS design-system parity: new per-client columns + "Salman Automates" seed.
-- Run in Supabase SQL editor (or via psql with the DB password). Idempotent.
-- Existing rows are untouched; new columns are nullable so nothing breaks.

-- 1. New columns ------------------------------------------------------------
alter table leads add column if not exists email              text;
alter table leads add column if not exists hours              text;
alter table leads add column if not exists gmb                text;
alter table leads add column if not exists services           jsonb;
alter table leads add column if not exists service_areas      jsonb;
alter table leads add column if not exists max_location_pages integer;
alter table leads add column if not exists lead_quote_enabled boolean;
alter table leads add column if not exists lead_quote_embed   text;
alter table leads add column if not exists hero_image_url     text;

-- 2. Seed / upsert the demo client -----------------------------------------
update leads set
  business_name        = 'Salman Automates',
  phone                = '+14372382460',
  email                = 'salman@gondaltech.com',
  city                 = 'Toronto',
  address              = 'Toronto, ON, Canada',
  hours                = 'Mon-Fri 8am-6pm, Sat 9am-2pm',
  rating               = 4.9,
  reviews              = 127,
  color_primary        = '#193c71',
  color_secondary      = '#204988',
  color_accent         = '#da3232',
  color_primary_light  = '#204988',
  color_text_on_primary= '#ffffff',
  color_text_on_accent = '#ffffff',
  logo_url             = 'https://services.leadconnectorhq.com/documents/download/3wX2FFu1BZ5z7eKhhoN3',
  gmb                  = 'https://localgrowthstudio.com/',
  services             = '["Air Conditioner Installation","Air Conditioner Repair","Air Conditioner Maintenance","Furnace Installation","Furnace Repair","Furnace Maintenance","Heat Pump Installation","Heat Pump Repair","Heat Pump Maintenance","Ductless Mini-Split Installation","Ductless Mini-Split Repair","Boiler Installation"]'::jsonb,
  service_areas        = '["Toronto","North York","Scarborough","Etobicoke","East York","York","Mississauga","Brampton","Vaughan","Markham","Richmond Hill","Thornhill","Aurora","Newmarket"]'::jsonb,
  max_location_pages   = 8,
  lead_quote_enabled   = true,
  lead_quote_embed     = '<iframe src="https://app.leadder.io/widget/salman-automates" width="100%" height="700" frameborder="0" style="border:none;max-width:100%"></iframe>',
  hero_image_url       = null,
  expires_at           = null,
  style_status         = 'SUCCESS'
where slug = 'salman-automates';

-- If the row does not exist yet, insert it instead:
insert into leads (slug, business_name, phone, email, city, address, hours, rating, reviews,
  color_primary, color_secondary, color_accent, color_primary_light, color_text_on_primary,
  color_text_on_accent, logo_url, gmb, services, service_areas, max_location_pages,
  lead_quote_enabled, lead_quote_embed, style_status)
select 'salman-automates','Salman Automates','+14372382460','salman@gondaltech.com','Toronto',
  'Toronto, ON, Canada','Mon-Fri 8am-6pm, Sat 9am-2pm',4.9,127,
  '#193c71','#204988','#da3232','#204988','#ffffff','#ffffff',
  'https://services.leadconnectorhq.com/documents/download/3wX2FFu1BZ5z7eKhhoN3',
  'https://localgrowthstudio.com/',
  '["Air Conditioner Installation","Air Conditioner Repair","Air Conditioner Maintenance","Furnace Installation","Furnace Repair","Furnace Maintenance","Heat Pump Installation","Heat Pump Repair","Heat Pump Maintenance","Ductless Mini-Split Installation","Ductless Mini-Split Repair","Boiler Installation"]'::jsonb,
  '["Toronto","North York","Scarborough","Etobicoke","East York","York","Mississauga","Brampton","Vaughan","Markham","Richmond Hill","Thornhill","Aurora","Newmarket"]'::jsonb,
  8, true,
  '<iframe src="https://app.leadder.io/widget/salman-automates" width="100%" height="700" frameborder="0" style="border:none;max-width:100%"></iframe>',
  'SUCCESS'
where not exists (select 1 from leads where slug = 'salman-automates');
