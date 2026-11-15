-- Order numbers: 10 random digits instead of 6, so public /order/<number> lookups cannot be enumerated.
do $$
declare d text;
begin
  select pg_get_functiondef('public.create_order(uuid,text,text,text,text,text,text,text,text,text,text,text,text,jsonb,text)'::regprocedure) into d;
  if position('lpad((floor(random()*1000000))::int::text,6,''0'')' in d) = 0 then
    raise exception 'expected order-number expression not found';
  end if;
  d := replace(d, 'lpad((floor(random()*1000000))::int::text,6,''0'')', 'lpad((floor(random()*10000000000))::bigint::text,10,''0'')');
  execute d;
end $$;
