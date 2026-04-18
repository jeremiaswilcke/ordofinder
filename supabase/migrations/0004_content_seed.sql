insert into public.churches (
  slug, name, address, city, country_code, subdivision_code, postal_code, latitude, longitude, timezone,
  diocese, consecration_year, architectural_style, capacity, short_note, description, status
) values
  (
    'stephansdom', 'Stephansdom', 'Stephansplatz 3, 1010 Vienna', 'Vienna', 'AT', 'AT-9', '1010', 48.208500, 16.373100, 'Europe/Vienna',
    'Erzdioezese Wien', 1147, 'gothic', 20000, 'Cathedral archive with Latin and German celebrations.',
    'The cathedral anchor of Vienna''s Catholic life, with a broad liturgical rhythm, strong musical culture and a public-facing archival presence.', 'approved'
  ),
  (
    'peterskirche-vienna', 'Peterskirche', 'Petersplatz 1, 1010 Vienna', 'Vienna', 'AT', 'AT-9', '1010', 48.210400, 16.369500, 'Europe/Vienna',
    'Erzdioezese Wien', 1733, 'baroque', 500, 'Italian community and strong adoration rhythm.',
    'A baroque interior with a steady devotional life, daily adoration and a cultivated music program that makes it ideal for the archive''s editorial voice.', 'approved'
  ),
  (
    'karlskirche', 'Karlskirche', 'Karlsplatz 10, 1040 Vienna', 'Vienna', 'AT', 'AT-9', '1040', 48.198200, 16.371700, 'Europe/Vienna',
    null, 1737, 'baroque', 800, 'Polyphony-rich celebration in a monumental setting.',
    'An archival favorite for polyphonic liturgy, generous acoustics and a composed, urbane prayer atmosphere.', 'approved'
  ),
  (
    'st-patricks-cathedral', 'St. Patrick''s Cathedral', '5th Avenue, New York, NY 10022', 'New York', 'US', 'US-NY', '10022', 40.758500, -73.975000, 'America/New_York',
    'Archdiocese of New York', 1879, 'gothic_revival', 3000, 'Urban cathedral archive with broad English schedule.',
    'A highly visible urban cathedral balancing visitor traffic with a recognizable sacramental rhythm and strong choir traditions.', 'approved'
  ),
  (
    'st-georges-syro-malabar-cathedral', 'St. George''s Syro-Malabar Cathedral', 'Palace Road, Thrissur', 'Thrissur', 'IN', 'IN-KL', null, 10.527600, 76.214400, 'Asia/Kolkata',
    'Archdiocese of Thrissur', 1814, 'other', 2500, 'Eastern Catholic archive with deeply rooted communal participation.',
    'A Syro-Malabar cathedral with a strong daily rhythm, visibly communal prayer and a local liturgical identity that broadens the archive''s global frame.', 'approved'
  ),
  (
    'santa-maria-maggiore', 'Santa Maria Maggiore', 'Piazza di Santa Maria Maggiore, Rome', 'Rome', 'IT', 'IT-RM', null, 41.897800, 12.498900, 'Europe/Rome',
    'Diocese of Rome', 432, 'romanesque', 5000, 'Ancient Marian basilica with layered liturgical memory.',
    'One of Rome''s foundational basilicas, holding together pilgrimage, solemnity and a stable pattern of reverent celebration.', 'approved'
  )
on conflict (slug) do nothing;
