// v12.0.2 — Click-to-open podcast cards (no iframe embeds)
// Each podcast links to its Spotify/YouTube page in a new tab
// Cleaner UX, zero CSP/404 risk, works across all browsers.

export const PODCASTS = [
  {
    id: 'grand-tamasha',
    name: 'Grand Tamasha',
    host: 'Milan Vaishnav · Carnegie',
    topics: ['elections', 'federalism', 'foreign-policy'],
    description: 'Deep-dive interviews on Indian politics, policy, and democracy with scholars and practitioners.',
    platform: 'Spotify',
    url: 'https://open.spotify.com/search/Grand%20Tamasha%20Milan%20Vaishnav',
    color: '#1DB954',
  },
  {
    id: 'seen-and-unseen',
    name: 'The Seen and the Unseen',
    host: 'Amit Varma',
    topics: ['liberty', 'economics', 'civic'],
    description: 'Long-form conversations on liberty, Indian society, economics, and the unintended consequences of policy.',
    platform: 'Website',
    url: 'https://seenunseen.in',
    color: '#F5B93A',
  },
  {
    id: 'puliyabaazi',
    name: 'Puliyabaazi',
    host: 'Pranay Kotasthane & Saurabh Chandra',
    topics: ['policy', 'federalism'],
    description: 'Hindi-English podcast on Indian public policy, urban issues, and civic design.',
    platform: 'Website',
    url: 'https://puliyabaazi.in',
    color: '#E24B4A',
  },
  {
    id: 'all-indians-matter',
    name: 'All Indians Matter',
    host: 'Ashraf Engineer',
    topics: ['rights', 'minorities', 'social-justice'],
    description: 'Weekly commentary on civil liberties, secularism, and the state of Indian democracy.',
    platform: 'Website',
    url: 'https://allindiansmatter.in',
    color: '#4A8FFF',
  },
  {
    id: 'suno-india',
    name: 'The Suno India Show',
    host: 'Suno India',
    topics: ['human-rights', 'environment', 'gender'],
    description: 'Investigative reporting podcast covering underreported issues — gender, caste, environment, rights.',
    platform: 'Website',
    url: 'https://sunoindia.in',
    color: '#9B59B6',
  },
  {
    id: 'india-dialog',
    name: 'The India Dialog',
    host: 'Constitutional & legal scholars',
    topics: ['constitution', 'judiciary'],
    description: 'Podcast series on Indian constitutional law, landmark judgments, and institutional history.',
    platform: 'YouTube',
    url: 'https://www.youtube.com/results?search_query=india+dialog+constitutional+law+podcast',
    color: '#FF0000',
  },
];

export const TOPICS = [
  'elections', 'constitution', 'federalism', 'rights', 'policy',
  'judiciary', 'minorities', 'liberty', 'environment', 'foreign-policy',
  'social-justice', 'human-rights', 'economics', 'civic', 'gender',
];