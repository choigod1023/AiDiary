// 최소한의 서비스 워커 (푸시 알림만 지원)
const CACHE_VERSION = 'v8';
const CACHE_NAME = `mood-journal-${CACHE_VERSION}`;

// Service Worker 설치 (최소화)
self.addEventListener('install', (event) => {
    // skipWaiting과 캐시 설치 모두 제거
    console.log('Service Worker installed (minimal version)');
});

// Service Worker 활성화 (최소화)
self.addEventListener('activate', (event) => {
    console.log('Service Worker activated (minimal version)');
});

// 네트워크 요청은 완전히 우회 (캐싱 없음)
self.addEventListener('fetch', (event) => {
    // 모든 요청을 네트워크로 직접 전달
    event.respondWith(fetch(event.request));
});

// 메시지 처리 (최소화)
self.addEventListener('message', (event) => {
    // 모든 메시지 무시
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
