# Mobile Movie App

A mobile app built with Expo + React Native demonstrating movie search, trending lists, and saved items. It uses Expo Router for file-based navigation and optionally Appwrite for backend services.

## Table of contents

- Project overview
- Tech stack
- Prerequisites
- Install & run
- Available scripts
- Project structure
- Common issues & fixes (warnings/errors you reported)
- Troubleshooting tips
- Contributing

## Project overview

This project shows a small movie browsing application with screens for search, trending movies, saved items, and detail pages. It was created with `create-expo-app` and uses Expo Router for routing.

## Tech stack

- Expo
- React / React Native
- Expo Router
- NativeWind (Tailwind for React Native)
- Appwrite (optional)
- react-native-safe-area-context

(See exact versions in `package.json`)

## Prerequisites

- Node.js (LTS recommended)
- npm (or yarn)
- Optional: Expo CLI for convenience (you can use `npx expo ...`)
- For emulators: Android Studio (Android) or Xcode (iOS)
- Expo Go on your device for testing via QR (or a development build if you use native modules)

## Install & run

1. Install dependencies

```bash
npm install
```

2. Start Metro / Expo

```bash
npx expo start
```

- Open on Android: `npm run android` or press `a` in the Expo terminal
- Open on iOS: `npm run ios` or press `i`
- Open on web: `npm run web`

Note: Ensure your computer and phone are on the same Wi‑Fi network. If not, use the "tunnel" option in the Expo devtools.

## Available scripts

From `package.json`:

- `start` — `expo start`
- `reset-project` — `node ./scripts/reset-project.js`
- `android` — `expo start --android`
- `ios` — `expo start --ios`
- `web` — `expo start --web`
- `lint` — `expo lint`

## Project structure (summary)

- `app/` — routes and screens (`_layout.tsx`, `(tabs)/index.tsx`, `movies/[id].tsx`, etc.)
- `components/` — `MovieCard.tsx`, `SearchBar.tsx`, `TrendingCard.tsx`
- `assets/` — images, icons, fonts
- `services/` — `api.ts`, `appwrite.ts`, `useFetch.ts`
- `constants/`, `interfaces/`, `types/` — utilities and types

## Common issues & fixes

Below are the fixes and recommendations for the warnings/errors you reported. Copy and adapt the snippets into your code.

1) Deprecated SafeAreaView warning

Warning: "SafeAreaView has been deprecated and will be removed in a future release. Please use 'react-native-safe-area-context'"

Fix: Replace `SafeAreaView` import from `react-native` with the one from `react-native-safe-area-context`.

Replace:

```diff
- import { SafeAreaView } from 'react-native'
+ import { SafeAreaView } from 'react-native-safe-area-context'
```

You can also wrap your app with `SafeAreaProvider` at the root for more advanced usage.

2) VirtualizedLists nested inside ScrollView

Warning: "VirtualizedLists should never be nested inside plain ScrollViews with the same orientation because it can break windowing and other functionality"

Cause: A `FlatList` (or other VirtualizedList) is rendered inside a `ScrollView` with the same scroll orientation (usually vertical).

Preferred fixes:

- Option A (recommended): Remove the outer `ScrollView` and use a single `FlatList` for the entire scrollable area. Put static content into `ListHeaderComponent` and `ListFooterComponent`.

- Option B: If you must nest, use `nestedScrollEnabled` on the inner list (helps on Android):

```
<FlatList
  nestedScrollEnabled={true}
  data={[]}
  renderItem={() => null}
  keyExtractor={(item, index) => String(index)}
/>
```

Note: `nestedScrollEnabled` is a workaround and not as robust as consolidating into one `FlatList`.

3) Want same behavior as ScrollView but without warning

Use a `FlatList` as the main scroll container and move the static top content (logo, search bar, headings) into `ListHeaderComponent`. This preserves smooth windowing and avoids the nested VirtualizedLists warning.

Example:

```
<FlatList
  data={movies}
  renderItem={renderMovie}
  keyExtractor={(item) => item.id.toString()}
  ListHeaderComponent={() => (
    <View style={{ paddingHorizontal: 20 }}>
      <Image source={icons.logo} style={{ width: 48, height: 40, alignSelf: 'center' }} />
      <SearchBar onPress={() => router.push('/search')} />
      <Text style={{ color: 'white', fontWeight: 'bold' }}>Latest Movies</Text>
    </View>
  )}
  contentContainerStyle={{ paddingBottom: 20 }}
/>
```

4) SearchBar too wide / absolute positioning inside `ListHeaderComponent`

Problem: An absolutely positioned `SearchBar` inside the `ListHeaderComponent` can cause incorrect width and layout issues.

Options:

- Preferred: Avoid `position: 'absolute'`. Place `SearchBar` normally inside `ListHeaderComponent` and control spacing via padding/margin.

- If you need a fixed absolute SearchBar (always visible), move it out of the `FlatList` into a parent container (e.g. `app/_layout.tsx`) and add top padding to the FlatList's `contentContainerStyle` so the list content is not hidden under the SearchBar.

Example (recommended):

```
ListHeaderComponent={() => (
  <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
    <Image source={icons.logo} style={{ width: 48, height: 40, alignSelf: 'center' }} />
    <SearchBar style={{ width: '100%', maxWidth: 600 }} onPress={() => router.push('/search')} placeholder="Search for a movie" />
    <Text style={{ color: 'white', fontWeight: 'bold' }}>Latest Movies</Text>
  </View>
)}
```

Example (absolute, outside FlatList):

```
<View style={{ flex: 1 }}>
  <FlatList
    data={movies}
    ListHeaderComponent={() => <View style={{ height: 120 }} />} // placeholder space
    contentContainerStyle={{ paddingTop: 120 }}
    // other FlatList props here
  />

  <View style={{ position: 'absolute', top: 40, left: 20, right: 20 }}>
    <SearchBar />
  </View>
</View>
```

5) "Can't perform a React state update on a component that hasn't mounted yet"

Cause: An async operation (fetch, promise, timer) updates state after the component has unmounted.

Fix: Move async logic into `useEffect` and guard updates with a `mounted` flag or use `AbortController` to cancel fetches.

Pattern with `mounted` flag:

```
useEffect(() => {
  let mounted = true;

  async function load() {
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (!mounted) return;
      setData(json);
    } catch (err) {
      if (!mounted) return;
      setError(err);
    }
  }

  load();
  return () => { mounted = false };
}, [url]);
```

Pattern with `AbortController`:

```
useEffect(() => {
  const ac = new AbortController();
  fetch(url, { signal: ac.signal })
    .then(resp => resp.json())
    .then(json => setData(json))
    .catch(err => {
      if (err.name === 'AbortError') return;
      setError(err);
    });
  return () => ac.abort();
}, [url]);
```

Note: The error you posted pointed at `index.tsx` where `trendingMovies` is used during render. Make sure `trendingMovies` is set inside an effect and that you protect state updates as shown above.

## Troubleshooting Expo connectivity

- Ensure device and computer are on same network or use the Expo "tunnel" option.
- Clear Metro cache: `npx expo start -c`.
- If you use native libraries not available in Expo Go, create a development build or use `eas build` / `expo prebuild`.
- Check the Metro URL (e.g. `exp://192.168.x.x:8081`) — if the IP is wrong, switch to tunnel.

## Contributing

Contributions welcome. Open issues for bugs and feature requests or create PRs.

---

If you want, I can also open PRs to apply code fixes: replace `SafeAreaView` imports everywhere, move the `SearchBar` into `ListHeaderComponent`, or add `useEffect` guards for async state updates. Tell me which changes you want me to apply automatically and I will implement them and run a quick validation check.
