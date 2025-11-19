import React, {useEffect, useState} from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import {ActivityIndicator, Image, Text, View} from "react-native";
import {images} from "@/constants/images";
import {useRouter} from "expo-router";
import useFetch from "@/services/useFetch";
import {fetchMovies} from "@/services/api";
import {FlatList} from "react-native-reanimated/src/Animated";
import MovieCard from "@/components/MovieCard";
import {icons} from "@/constants/icons";
import SearchBar from "@/components/SearchBar";
import {updateSearchCount} from "@/services/appwrite";

const Search = () => {
    const [searchQuery, setSearchQuery] = useState('')

    const router = useRouter();

    const {
        data: movies,
        loading: moviesLoading,
        error: moviesError,
        refetch: loadMovies,
        reset,
    } = useFetch(() => fetchMovies({query: searchQuery}), true);

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchQuery.trim()) {
                await loadMovies()

                if (movies?.length > 0 && movies?.[0])
                    await updateSearchCount(searchQuery, movies[0])
            } else {
                reset()
            }
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [searchQuery]);

    useEffect(() => {
        if (movies?.length > 0 && movies?.[0])
             updateSearchCount(searchQuery, movies[0])
    }, [movies]);
    return (
        <SafeAreaView className="flex-1 bg-primary">
            <Image source={images.bg} className="w-full absolute z-0 flex-1"/>
            <FlatList
                data={movies}
                renderItem={({item}) => <MovieCard {...item} />}
                keyExtractor={(item) => item.id}
                className="px-5"
                numColumns={3}
                columnWrapperStyle={{
                    justifyContent: 'center',
                    gap: 16,
                    marginVertical: 16,
                }}
                contentContainerStyle={{
                    paddingBottom: 100,
                }}
                ListHeaderComponent={
                    <>
                        <View className="w-full mt-20 flex-row items-center justify-center">
                            <Image source={icons.logo} className="w-12 h-10"/>
                        </View>

                        <View className="my-5">
                            <SearchBar
                                placeholder="Search movies ..."
                                value={searchQuery}
                                onChangeText={(text: string) => setSearchQuery(text)}
                            />
                        </View>

                        {moviesLoading && (
                            <ActivityIndicator size="large" color="#0000ff"/>
                        )}

                        {moviesError && (
                            <Text className="text-red-500 px-5 my-3">
                                Error: {moviesError.message}
                            </Text>
                        )}

                        {!moviesLoading && !moviesError && searchQuery.trim() && movies?.length > 0 && (
                            <Text className="text-xl text-white font-bold">
                                Search Results for {' '}
                                <Text className="text-accent">{searchQuery}</Text>
                            </Text>
                        )}
                    </>
                }
                ListEmptyComponent={
                    !moviesLoading && !moviesError && searchQuery.trim() && movies?.length === 0 ? (
                        <SafeAreaView className="mt-10 px-5">
                            <Text className="text-center text-gray-500">
                                {searchQuery.trim() ? 'No movies found' : 'Search'}
                            </Text>
                        </SafeAreaView>
                    ) : null
                }
            />
        </SafeAreaView>
    )
}
export default Search
