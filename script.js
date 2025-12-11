// 기본 팀 데이터 (초기값)
const defaultTeamData = {
    "1조": ["김민수", "이지영", "박철수", "정소희", "최동욱"],
    "2조": ["송하늘", "윤미래", "강바다", "임나무", "오별님"],
    "3조": ["한사랑", "노을빛", "구름이", "달빛이", "햇살이"],
    "4조": ["권도윤", "서예린", "조민호", "배수진", "양태현"],
    "5조": ["신우주", "문별이", "성하늘", "차바다", "황금빛"]
};

// 팀 데이터 초기화 (나중에 loadTeamData()로 설정)
let teamData;

// Firebase 설정 (사용자 전용 실시간 데이터베이스)
const firebaseConfig = {
    apiKey: "AIzaSyDK0zBBUmbMHnb_2JO6CjMyDCiYLB8lJLM",
    authDomain: "find-my-jo.firebaseapp.com",
    databaseURL: "https://find-my-jo-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "find-my-jo",
    storageBucket: "find-my-jo.firebasestorage.app",
    messagingSenderId: "411258893900",
    appId: "1:411258893900:web:fe4f4ccde7e1f8aac226e9"
};

// Firebase 초기화
let database;
try {
    firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    console.log('🔥 Firebase 초기화 완료');
} catch (e) {
    console.error('❌ Firebase 초기화 실패:', e);
}

// 관리자 인증 (난독화된 비밀번호)
const _0x4a8b = ['ZWR1aHJk', 'YXRvYg=='];
const _0x3c9d = (function() { return atob(_0x4a8b[1]); })();
let isAdminLoggedIn = false;

// Firebase에서 실시간 데이터 불러오기
async function loadTeamDataFromFirebase() {
    return new Promise((resolve) => {
        try {
            console.log('🔥 Firebase에서 팀 데이터 불러오는 중...');

            const ref = database.ref('teamData');
            ref.once('value', (snapshot) => {
                const data = snapshot.val();

                if (data) {
                    console.log('✅ Firebase에서 팀 데이터 불러오기 성공:', data);
                    resolve(data);
                } else {
                    console.log('ℹ️ Firebase에 데이터 없음. 기본 데이터를 업로드합니다.');
                    // 기본 데이터를 Firebase에 업로드
                    ref.set(defaultTeamData).then(() => {
                        console.log('✅ 기본 데이터 Firebase 업로드 완료');
                        resolve(defaultTeamData);
                    });
                }
            }, (error) => {
                console.error('❌ Firebase에서 데이터 로딩 실패:', error);
                console.log('📱 localStorage 백업 시도...');
                resolve(loadTeamDataFromLocalStorage());
            });

            // 실시간 업데이트 리스너
            ref.on('value', (snapshot) => {
                const newData = snapshot.val();
                if (newData && JSON.stringify(newData) !== JSON.stringify(teamData)) {
                    console.log('🔄 Firebase에서 실시간 데이터 업데이트:', newData);
                    teamData = newData;

                    // 현재 화면 업데이트
                    const resultSection = document.getElementById('result');
                    const notFoundSection = document.getElementById('notFound');
                    if (!resultSection.classList.contains('hidden') || !notFoundSection.classList.contains('hidden')) {
                        // 검색 결과가 표시중이라면 다시 검색해서 업데이트
                        const nameInput = document.getElementById('nameInput');
                        if (nameInput && nameInput.value.trim()) {
                            const result = findTeamByName(nameInput.value.trim());
                            displayResult(result);
                        }
                    }
                }
            });

        } catch (e) {
            console.error('❌ Firebase 연결 실패:', e);
            console.log('📱 localStorage 백업 시도...');
            resolve(loadTeamDataFromLocalStorage());
        }
    });
}

// localStorage에서 팀 데이터 불러오기 (백업용)
function loadTeamDataFromLocalStorage() {
    try {
        const saved = localStorage.getItem('teamData');
        if (saved) {
            console.log('✅ localStorage 백업에서 팀 데이터 불러오기 성공:', JSON.parse(saved));
            return JSON.parse(saved);
        } else {
            console.log('ℹ️ localStorage에 저장된 데이터 없음. 기본 데이터 사용');
            return defaultTeamData;
        }
    } catch (e) {
        console.error('❌ localStorage에서 데이터 로딩 실패:', e);
        return defaultTeamData;
    }
}

// 메인 데이터 로딩 함수
async function loadTeamData() {
    if (database) {
        return await loadTeamDataFromFirebase();
    } else {
        console.log('⚠️ Firebase 연결 실패. localStorage 사용');
        return loadTeamDataFromLocalStorage();
    }
}

// GitHub Gist에 팀 데이터 저장하기
async function saveTeamDataToGist(data) {
    if (!GITHUB_CONFIG.token || !GITHUB_CONFIG.gistId) {
        console.error('❌ GitHub 설정 없음 (token 또는 gistId)');
        return false;
    }

    try {
        console.log('🌐 GitHub Gist에 팀 데이터 저장 중...');

        const response = await fetch(`https://api.github.com/gists/${GITHUB_CONFIG.gistId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                files: {
                    [GITHUB_CONFIG.filename]: {
                        content: JSON.stringify(data, null, 2)
                    }
                }
            })
        });

        if (!response.ok) {
            throw new Error(`GitHub API 오류: ${response.status}`);
        }

        console.log('✅ GitHub Gist에 팀 데이터 저장 성공:', data);

        // 백업으로 localStorage에도 저장
        saveTeamDataToLocalStorage(data);

        return true;
    } catch (e) {
        console.error('❌ GitHub Gist 저장 실패:', e);
        console.log('📱 localStorage 백업 저장 시도...');
        return saveTeamDataToLocalStorage(data);
    }
}

// localStorage에 팀 데이터 저장하기 (백업용)
function saveTeamDataToLocalStorage(data) {
    try {
        localStorage.setItem('teamData', JSON.stringify(data));
        console.log('✅ localStorage에 팀 데이터 저장 성공:', data);
        return true;
    } catch (e) {
        console.error('❌ localStorage 저장 실패:', e);
        return false;
    }
}

// Firebase에 팀 데이터 저장하기
async function saveTeamDataToFirebase(data) {
    try {
        console.log('🔥 Firebase에 팀 데이터 저장 중...');

        const ref = database.ref('teamData');
        await ref.set(data);

        console.log('✅ Firebase에 팀 데이터 저장 성공:', data);

        // 백업으로 localStorage에도 저장
        saveTeamDataToLocalStorage(data);

        return true;
    } catch (e) {
        console.error('❌ Firebase 저장 실패:', e);
        console.log('📱 localStorage 백업 저장 시도...');
        return saveTeamDataToLocalStorage(data);
    }
}

// 메인 저장 함수
async function saveTeamData(data) {
    if (database) {
        return await saveTeamDataToFirebase(data);
    } else {
        console.log('⚠️ Firebase 연결 실패. localStorage만 사용');
        return saveTeamDataToLocalStorage(data);
    }
}

// 비밀번호 검증 함수
function verifyPassword(inputPassword) {
    try {
        const key = window[_0x3c9d];
        if (!key) return false;
        const decoded = key(_0x4a8b[0]);
        return inputPassword === decoded;
    } catch (e) {
        return false;
    }
}

// 이름으로 팀 찾기 함수
// 이름에서 괄호 앞부분(순수 이름)만 추출
function extractPureName(fullName) {
    const match = fullName.match(/^([^(]+)/);
    return match ? match[1].trim() : fullName.trim();
}

// 이름으로 팀 찾기 (동명이인 지원 - 여러 결과 반환)
function findTeamsByName(searchName) {
    const results = [];
    const searchPureName = extractPureName(searchName);

    for (const [teamNumber, members] of Object.entries(teamData)) {
        for (const member of members) {
            const memberPureName = extractPureName(member);
            // 순수 이름이 일치하면 결과에 추가
            if (memberPureName === searchPureName) {
                results.push({
                    teamNumber: teamNumber,
                    members: members,
                    currentUser: member  // 실제 저장된 이름 (팀 정보 포함)
                });
            }
        }
    }
    return results.length > 0 ? results : null;
}

// 결과 표시 함수 (여러 결과 지원)
function displayResults(results) {
    const resultSection = document.getElementById('result');
    const notFoundSection = document.getElementById('notFound');

    if (results && results.length > 0) {
        // 여러 결과가 있을 경우 모두 표시
        const teamNumberEl = document.getElementById('teamNumber');
        const memberList = document.getElementById('memberList');
        memberList.innerHTML = '';

        if (results.length === 1) {
            // 단일 결과
            const result = results[0];
            teamNumberEl.textContent = result.teamNumber;

            result.members.forEach(member => {
                const memberItem = document.createElement('div');
                memberItem.className = 'member-item';
                memberItem.textContent = member;

                if (member === result.currentUser) {
                    memberItem.classList.add('current-user');
                    memberItem.textContent += ' (나)';
                }

                memberList.appendChild(memberItem);
            });
        } else {
            // 동명이인 - 여러 결과
            teamNumberEl.textContent = `${results.length}명의 동명이인 발견`;

            results.forEach((result, index) => {
                // 구분선 (첫 번째 제외)
                if (index > 0) {
                    const divider = document.createElement('div');
                    divider.className = 'team-divider';
                    divider.innerHTML = '<hr>';
                    memberList.appendChild(divider);
                }

                // 팀 헤더
                const teamHeader = document.createElement('div');
                teamHeader.className = 'team-header';
                teamHeader.textContent = `📌 ${result.teamNumber}`;
                teamHeader.style.fontWeight = 'bold';
                teamHeader.style.marginTop = index > 0 ? '15px' : '0';
                teamHeader.style.marginBottom = '10px';
                teamHeader.style.fontSize = '1.1em';
                memberList.appendChild(teamHeader);

                // 팀원 목록
                result.members.forEach(member => {
                    const memberItem = document.createElement('div');
                    memberItem.className = 'member-item';
                    memberItem.textContent = member;

                    if (member === result.currentUser) {
                        memberItem.classList.add('current-user');
                        memberItem.textContent += ' (나)';
                    }

                    memberList.appendChild(memberItem);
                });
            });
        }

        // 결과 표시, 에러 숨기기
        resultSection.classList.remove('hidden');
        notFoundSection.classList.add('hidden');
    } else {
        // 찾을 수 없음 표시
        resultSection.classList.add('hidden');
        notFoundSection.classList.remove('hidden');
    }
}

// 검색 함수
function searchTeam() {
    const nameInput = document.getElementById('nameInput');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('이름을 입력해주세요.');
        nameInput.focus();
        return;
    }
    
    const results = findTeamsByName(name);
    displayResults(results);
    
    // 입력 필드 포커스 유지
    setTimeout(() => {
        nameInput.select();
    }, 100);
}

// 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', async function() {
    // 페이지 로드시 팀 데이터 불러오기
    console.log('🚀 페이지 로드됨. 팀 데이터 불러오는 중...');
    teamData = await loadTeamData();
    console.log('📊 현재 teamData:', teamData);
    const nameInput = document.getElementById('nameInput');
    const searchBtn = document.getElementById('searchBtn');
    
    // 검색 버튼 클릭
    searchBtn.addEventListener('click', searchTeam);
    
    // 엔터키 검색
    nameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchTeam();
        }
    });
    
    // 입력 필드에 포커스
    nameInput.focus();
    
    // 입력값이 변경될 때 결과 숨기기
    nameInput.addEventListener('input', function() {
        const resultSection = document.getElementById('result');
        const notFoundSection = document.getElementById('notFound');
        resultSection.classList.add('hidden');
        notFoundSection.classList.add('hidden');
    });
    
    // 관리자 관련 이벤트 리스너
    document.getElementById('adminToggle').addEventListener('click', showAdminModal);
    document.getElementById('adminCloseBtn').addEventListener('click', hideAdminModal);
    document.getElementById('adminLoginBtn').addEventListener('click', adminLogin);
    document.getElementById('adminBackBtn').addEventListener('click', hideAdminPanel);
    document.getElementById('adminLogoutBtn').addEventListener('click', hideAdminPanel);
    document.getElementById('uploadBtn').addEventListener('click', uploadCSV);
    document.getElementById('downloadTemplateBtn').addEventListener('click', downloadCSVTemplate);
    
    // 관리자 비밀번호 입력시 엔터키
    document.getElementById('adminPassword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            adminLogin();
        }
    });
    
    // 모달 배경 클릭시 닫기
    document.getElementById('adminModal').addEventListener('click', function(e) {
        if (e.target === this) {
            hideAdminModal();
        }
    });
    
    document.getElementById('adminPanel').addEventListener('click', function(e) {
        if (e.target === this) {
            hideAdminPanel();
        }
    });
});

// QR 코드 스캔 시뮬레이션 (실제 QR 스캐너 연동시 사용)
function handleQRScan(name) {
    const nameInput = document.getElementById('nameInput');
    nameInput.value = name;
    searchTeam();
}

// 관리자 기능들
function showAdminModal() {
    const adminModal = document.getElementById('adminModal');
    adminModal.classList.remove('hidden');
    document.getElementById('adminPassword').focus();
}

function hideAdminModal() {
    const adminModal = document.getElementById('adminModal');
    adminModal.classList.add('hidden');
    document.getElementById('adminPassword').value = '';
}

function adminLogin() {
    const password = document.getElementById('adminPassword').value;
    if (verifyPassword(password)) {
        isAdminLoggedIn = true;
        hideAdminModal();
        showAdminPanel();
    } else {
        alert('비밀번호가 틀렸습니다.');
        document.getElementById('adminPassword').select();
    }
}

function showAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    adminPanel.classList.remove('hidden');
    displayCurrentTeams();
}

function hideAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    adminPanel.classList.add('hidden');
    isAdminLoggedIn = false;
}

function displayCurrentTeams() {
    const currentTeams = document.getElementById('currentTeams');
    currentTeams.innerHTML = '';
    
    for (const [teamNumber, members] of Object.entries(teamData)) {
        const teamItem = document.createElement('div');
        teamItem.className = 'team-item';
        
        teamItem.innerHTML = `
            <h5>${teamNumber}</h5>
            <div class="team-members">
                ${members.map(member => `<span>${member}</span>`).join('')}
            </div>
        `;
        
        currentTeams.appendChild(teamItem);
    }
}

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const newTeamData = {};
    let startIndex = 0;
    
    // 첫 번째 줄이 헤더인지 확인 (조, 조원1... 형태)
    if (lines.length > 0) {
        const firstLine = lines[0].trim();
        const firstParts = firstLine.split(',').map(part => part.trim());
        if (firstParts[0] === '조' && firstParts[1] === '조원1') {
            startIndex = 1; // 헤더 건너뛰기
        }
    }
    
    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const parts = line.split(',').map(part => part.trim());
        if (parts.length < 2) {
            throw new Error(`${i + 1}번째 줄: 최소 2개 열이 필요합니다 (조, 이름1)`);
        }
        
        const teamNumber = parts[0];
        const members = parts.slice(1).filter(name => name); // 빈 이름 제거
        
        if (!teamNumber || members.length === 0) {
            throw new Error(`${i + 1}번째 줄: 조명과 최소 1명의 이름이 필요합니다`);
        }
        
        newTeamData[teamNumber] = members;
    }
    
    return newTeamData;
}

async function uploadCSV() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    const uploadResult = document.getElementById('uploadResult');

    if (!file) {
        showUploadResult('파일을 선택해주세요.', false);
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const csvText = e.target.result;
            const newTeamData = parseCSV(csvText);

            // 기존 데이터를 새 데이터로 교체
            teamData = newTeamData;

            // GitHub Gist에 저장
            console.log('💾 CSV 업로드 완료. GitHub Gist에 저장 시도...');
            const saveSuccess = await saveTeamData(teamData);

            if (saveSuccess) {
                console.log('✅ 팀 데이터가 GitHub Gist에 저장되었습니다.');
            } else {
                console.error('❌ 데이터 저장 실패');
                alert('데이터 저장에 실패했습니다. GitHub 설정을 확인해주세요.');
            }

            // 현재 팀 데이터 표시 업데이트
            displayCurrentTeams();

            // 검색 결과 초기화
            const resultSection = document.getElementById('result');
            const notFoundSection = document.getElementById('notFound');
            resultSection.classList.add('hidden');
            notFoundSection.classList.add('hidden');

            showUploadResult(`성공적으로 업로드되었습니다. 총 ${Object.keys(newTeamData).length}개 조가 등록되었습니다.`, true);
            fileInput.value = ''; // 파일 입력 초기화

        } catch (error) {
            showUploadResult(`오류: ${error.message}`, false);
        }
    };

    reader.readAsText(file, 'UTF-8');
}

function showUploadResult(message, isSuccess) {
    const uploadResult = document.getElementById('uploadResult');
    uploadResult.textContent = message;
    uploadResult.className = 'upload-result ' + (isSuccess ? 'success' : 'error');
    uploadResult.classList.remove('hidden');
    
    // 5초 후 결과 메시지 숨기기
    setTimeout(() => {
        uploadResult.classList.add('hidden');
    }, 5000);
}

function downloadCSVTemplate() {
    // 최대 조원 수 계산
    let maxMembers = 0;
    for (const members of Object.values(teamData)) {
        maxMembers = Math.max(maxMembers, members.length);
    }
    
    // 헤더 생성
    const headers = ['조'];
    for (let i = 1; i <= maxMembers; i++) {
        headers.push(`조원${i}`);
    }
    
    // CSV 라인들 생성
    const csvLines = [];
    csvLines.push(headers.join(','));  // 헤더 추가
    
    for (const [teamNumber, members] of Object.entries(teamData)) {
        const line = [teamNumber];
        // 조원들 추가 (빈 칸은 공백으로 채움)
        for (let i = 0; i < maxMembers; i++) {
            line.push(members[i] || '');
        }
        csvLines.push(line.join(','));
    }
    
    const csvContent = csvLines.join('\n');
    
    // UTF-8 BOM 추가 (한글 깨짐 방지)
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // 다운로드 링크 생성
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    // 현재 날짜로 파일명 생성
    const now = new Date();
    const dateStr = now.getFullYear() + '' + 
                   String(now.getMonth() + 1).padStart(2, '0') + 
                   String(now.getDate()).padStart(2, '0');
    link.setAttribute('download', `조데이터_${dateStr}.csv`);
    
    // 다운로드 실행
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // URL 객체 해제
    URL.revokeObjectURL(url);
}


// 페이지 로드시 URL 파라미터에서 이름 확인 (QR 코드에서 리다이렉트된 경우)
window.addEventListener('load', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const nameFromQR = urlParams.get('name');

    if (nameFromQR) {
        handleQRScan(nameFromQR);
    }
});