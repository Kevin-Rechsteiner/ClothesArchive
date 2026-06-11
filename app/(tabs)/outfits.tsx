import { Image } from 'expo-image';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';

export default function OutfitsScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <Image
          source={require('@/assets/images_use/fashion-clothes_ZN97ZIF3ZU.jpg')}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
      }>
      <ThemedText type="title">Outfits</ThemedText>
      <ThemedText>Hier kannst du später deine Outfit-Ideen anzeigen.</ThemedText>
    </ParallaxScrollView>
  );
}