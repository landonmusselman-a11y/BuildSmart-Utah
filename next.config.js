/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Existing
      { protocol: 'https', hostname: '**.ivoryhomes.com' },
      { protocol: 'https', hostname: '**.richmondamerican.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // Builder logo hosts (for <Image> component and future use)
      { protocol: 'https', hostname: 's3.us-east-1.amazonaws.com' },
      { protocol: 'https', hostname: '**.drhorton.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'cdn.tollbrothers.com' },
      { protocol: 'https', hostname: '**.centurycommunities.com' },
      { protocol: 'https', hostname: 'mhc-p-001.sitecorecontenthub.cloud' },
      { protocol: 'https', hostname: '**.edgehomes.com' },
      { protocol: 'https', hostname: 'holmeshomes.com' },
      { protocol: 'https', hostname: 'perryhomesutah.com' },
      { protocol: 'https', hostname: '**.destinationhomes.com' },
      { protocol: 'https', hostname: 'static.fieldstonehomes.com' },
      { protocol: 'https', hostname: 'hamlethomes.com' },
      { protocol: 'https', hostname: 'garbetthomes.com' },
      { protocol: 'https', hostname: 'jthomashomes.com' },
    ],
  },
};

module.exports = nextConfig;
