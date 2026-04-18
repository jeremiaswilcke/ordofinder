insert into public.countries (code, name) values
  ('AT', 'Austria'),
  ('DE', 'Germany'),
  ('US', 'United States'),
  ('PH', 'Philippines'),
  ('IN', 'India'),
  ('IT', 'Italy')
on conflict (code) do nothing;

insert into public.subdivisions (code, country_code, name) values
  ('AT-9', 'AT', 'Vienna'),
  ('US-NY', 'US', 'New York'),
  ('IN-KL', 'IN', 'Kerala'),
  ('IT-RM', 'IT', 'Rome')
on conflict (code) do nothing;

insert into public.tags (slug, label_en, label_de) values
  ('reverent_liturgy', 'Reverent Liturgy', 'Reverente Liturgie'),
  ('traditional_style', 'Traditional Style', 'Traditioneller Stil'),
  ('family_friendly', 'Family Friendly', 'Familienfreundlich'),
  ('quiet_atmosphere', 'Quiet Atmosphere', 'Stille Atmosphaere'),
  ('structured_homily', 'Structured Homily', 'Strukturierte Predigt'),
  ('strong_catechesis', 'Strong Catechesis', 'Starke Katechese'),
  ('good_music', 'Good Music', 'Gute Musik'),
  ('adoration', 'Adoration', 'Anbetung'),
  ('confession_available', 'Confession Available', 'Beichte verfuegbar'),
  ('english_available', 'English Available', 'Englisch verfuegbar'),
  ('latin_available', 'Latin Available', 'Latein verfuegbar'),
  ('accessible', 'Accessible', 'Barrierefrei'),
  ('youth_guild', 'Youth Guild', 'Jugendbund'),
  ('daily_adoration', 'Daily Adoration', 'Taegliche Anbetung')
on conflict (slug) do nothing;

insert into public.music_styles (slug, label) values
  ('gregorian', 'Gregorian'),
  ('organ', 'Organ'),
  ('polyphony', 'Polyphony'),
  ('traditional_hymns', 'Traditional Hymns'),
  ('byzantine_chant', 'Byzantine Chant'),
  ('coptic_chant', 'Coptic Chant'),
  ('contemporary', 'Contemporary'),
  ('silent_mass', 'Silent Mass'),
  ('other', 'Other')
on conflict (slug) do nothing;
