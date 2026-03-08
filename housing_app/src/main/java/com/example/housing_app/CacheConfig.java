package com.example.housing_app;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.concurrent.TimeUnit;

/**
 * Configures Caffeine-backed caches for the application.
 *
 * marketData — static CSV data, never expires
 * aggregateStats — static stats, never expires
 * mlPredictions — ML results, expire after 10 minutes
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCache marketDataCache = new CaffeineCache("marketData",
                Caffeine.newBuilder().build());

        CaffeineCache aggregateStatsCache = new CaffeineCache("aggregateStats",
                Caffeine.newBuilder().build());

        CaffeineCache mlPredictionsCache = new CaffeineCache("mlPredictions",
                Caffeine.newBuilder()
                        .expireAfterWrite(10, TimeUnit.MINUTES)
                        .maximumSize(500)
                        .build());

        SimpleCacheManager manager = new SimpleCacheManager();
        manager.setCaches(Arrays.asList(marketDataCache, aggregateStatsCache, mlPredictionsCache));
        return manager;
    }
}
