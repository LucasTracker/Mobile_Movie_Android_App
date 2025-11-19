import {SafeAreaView} from "react-native-safe-area-context";
import {ActivityIndicator, Image, ScrollView, Text, View} from "react-native";
import {images} from "@/constants/images";
import {icons} from "@/constants/icons";
import SearchBar from "@/components/SearchBar";
import {useRouter} from "expo-router";
import useFetch from "@/services/useFetch";
import {fetchMovies} from "@/services/api";
import MovieCard from "@/components/MovieCard";
import Animated from "react-native-reanimated";
import {getTrendingMovies} from "@/services/appwrite";
import TrendingCard from "@/components/TrendingCard";

export default function Index() {
    const router = useRouter();

    const {
        data: trendingMovies,
        loading: trendingLoading,
        error: trendingError,
    } = useFetch(getTrendingMovies)

    const {
        data: movies,
        loading: moviesLoading,
        error: moviesError,
    } = useFetch(() => fetchMovies({query: ""}));

    const renderHeader = () => (
        <View className="px-5">
            <Image source={icons.logo} className="w-12 mb-2 h-10 mx-auto"/>

            <SearchBar
                onPress={() => router.push("/search")}
                placeholder="Search for a movie"
            />

            {trendingMovies && trendingMovies.length > 0 && (
                <View className="mt-10">
                    <Text className="text-lg text-white font-bold mb-8">
                        Trending Movies
                    </Text>

                    {/* ✅ Use ScrollView horizontal em vez de FlatList */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{paddingRight: 20}}
                    >
                        {trendingMovies.map((item, index) => (
                            <TrendingCard
                                key={item.movie_id || index}
                                movie={item}
                                index={index}
                            />
                        ))}
                    </ScrollView>
                </View>
            )}

            <Text className="text-lg text-white font-bold mt-4 mb-8">
                Latest Movies
            </Text>
        </View>
    );

    return (
        <SafeAreaView className="bg-primary flex-1 relative">
            <Image source={images.bg} className="w-full absolute z-0"/>

            {moviesLoading || trendingLoading ? (
                <ActivityIndicator
                    animating={moviesLoading || trendingLoading}
                    size="large"
                    color="#0000ff"
                    className="mt-10 self-center"
                />
            ) : moviesError || trendingError ? (
                <Text className="text-white text-center mt-10">
                    Error: {moviesError?.message || trendingError?.message}
                </Text>
            ) : (
                <Animated.FlatList
                    ListHeaderComponent={renderHeader}
                    data={movies}
                    renderItem={({item}) => <MovieCard {...item} />}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={3}
                    columnWrapperStyle={{
                        justifyContent: "flex-start",
                        gap: 20,
                        paddingRight: 5,
                        marginBottom: 10,
                    }}
                    contentContainerStyle={{
                        paddingTop: 0,
                        paddingHorizontal: 20,
                        paddingBottom: 40,
                    }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}