import Head from 'expo-router/head';
import { Platform } from 'react-native';

import type { PageMeta as PageMetaData } from '@/content/site';

/**
 * Sets the document title and description after the app loads (web only).
 * Static exports also read each route's generateMetadata(), see the route files.
 */
export function PageMeta({ title, description }: PageMetaData) {
  if (Platform.OS !== 'web') return null;
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
    </Head>
  );
}
