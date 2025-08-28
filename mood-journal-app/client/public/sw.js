const CACHE_NAME = 'mood-journal-v1';
const urlsToCache = [
    '/',
    '/write',
    '/list',
    '/stats',
    '/static/js/bundle.js',
    '/static/css/main.css'
];

// Service Worker 설치
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Service Worker 활성화
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 네트워크 요청 가로채기 (오프라인 지원)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // 캐시에서 찾으면 반환
                if (response) {
                    return response;
                }

                // 캐시에 없으면 네트워크에서 가져오기
                return fetch(event.request).then(
                    (response) => {
                        // 유효한 응답이 아니면 그대로 반환
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // 응답을 복제하여 캐시에 저장
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

// 푸시 알림 수신
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : '새로운 알림이 있습니다',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: '확인하기',
                icon: '/icons/icon-96x96.png'
            },
            {
                action: 'close',
                title: '닫기',
                icon: '/icons/icon-96x96.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Mood Journal', options)
    );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        // 앱 열기
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'close') {
        // 알림만 닫기
        event.notification.close();
    } else {
        // 기본 동작: 앱 열기
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// 백그라운드 동기화 (오프라인 데이터 동기화)
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // 오프라인에서 작성한 데이터를 서버에 동기화
            syncOfflineData()
        );
    }
});

// 오프라인 데이터 동기화 함수
async function syncOfflineData() {
    try {
        // IndexedDB에서 오프라인 데이터 가져오기
        const offlineData = await getOfflineData();

        if (offlineData.length > 0) {
            // 서버에 데이터 전송
            for (const data of offlineData) {
                await sendDataToServer(data);
            }

            // 동기화 완료 후 오프라인 데이터 삭제
            await clearOfflineData();
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// IndexedDB에서 오프라인 데이터 가져오기
async function getOfflineData() {
    // IndexedDB 구현은 별도로 필요
    return [];
}

// 서버에 데이터 전송
async function sendDataToServer(data) {
    // API 호출 구현
    return fetch('/api/diary', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
}

// 오프라인 데이터 삭제
async function clearOfflineData() {
    // IndexedDB 구현은 별도로 필요
}
