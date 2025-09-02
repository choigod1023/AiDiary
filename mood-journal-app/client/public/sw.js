const CACHE_VERSION = 'v3';
const CACHE_NAME = `mood-journal-${CACHE_VERSION}`;
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
    self.skipWaiting();
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
        }).then(() => self.clients.claim())
    );
});

// 네트워크 요청 가로채기 (오프라인 지원)
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Vite 개발 서버 요청은 캐시하지 않음
    if (url.pathname.startsWith('/@vite/') || url.pathname.startsWith('/__vite_ping')) {
        return;
    }

    // API 요청은 캐시하지 않음 (인증 상태 유지를 위해)
    if (url.pathname.startsWith('/api/') || url.hostname.includes('localhost')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // 인증 관련 요청은 캐시하지 않음
    if (url.pathname.includes('auth') || url.pathname.includes('login') || url.pathname.includes('logout')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // 동적 콘텐츠는 캐시하지 않음
    if (url.pathname.includes('.json') || url.pathname.includes('.xml')) {
        event.respondWith(fetch(event.request));
        return;
    }

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

                        // HTML 파일과 정적 자산만 캐시
                        const contentType = response.headers.get('content-type');
                        if (contentType && (
                            contentType.includes('text/html') ||
                            contentType.includes('text/css') ||
                            contentType.includes('application/javascript') ||
                            contentType.includes('image/')
                        )) {
                            // 응답을 복제하여 캐시에 저장
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });
                        }

                        return response;
                    }
                );
            })
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
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
