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

// 관리자 인증 (난독화된 비밀번호)
const _0x4a8b = ['ZWR1aHJk', 'YXRvYg=='];
const _0x3c9d = (function() { return atob(_0x4a8b[1]); })();
let isAdminLoggedIn = false;

// localStorage에서 팀 데이터 불러오기
function loadTeamData() {
    try {
        const saved = localStorage.getItem('teamData');
        return saved ? JSON.parse(saved) : defaultTeamData;
    } catch (e) {
        console.error('팀 데이터 로딩 실패:', e);
        return defaultTeamData;
    }
}

// localStorage에 팀 데이터 저장하기
function saveTeamData(data) {
    try {
        localStorage.setItem('teamData', JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('팀 데이터 저장 실패:', e);
        return false;
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
function findTeamByName(name) {
    for (const [teamNumber, members] of Object.entries(teamData)) {
        if (members.includes(name)) {
            return {
                teamNumber: teamNumber,
                members: members,
                currentUser: name
            };
        }
    }
    return null;
}

// 결과 표시 함수
function displayResult(result) {
    const resultSection = document.getElementById('result');
    const notFoundSection = document.getElementById('notFound');
    
    if (result) {
        // 팀 정보 표시
        document.getElementById('teamNumber').textContent = result.teamNumber;
        
        // 팀원 목록 표시
        const memberList = document.getElementById('memberList');
        memberList.innerHTML = '';
        
        result.members.forEach(member => {
            const memberItem = document.createElement('div');
            memberItem.className = 'member-item';
            memberItem.textContent = member;
            
            // 현재 사용자 강조
            if (member === result.currentUser) {
                memberItem.classList.add('current-user');
                memberItem.textContent += ' (나)';
            }
            
            memberList.appendChild(memberItem);
        });
        
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
    
    const result = findTeamByName(name);
    displayResult(result);
    
    // 입력 필드 포커스 유지
    setTimeout(() => {
        nameInput.select();
    }, 100);
}

// 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', function() {
    // 페이지 로드시 팀 데이터 불러오기
    teamData = loadTeamData();
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

function uploadCSV() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    const uploadResult = document.getElementById('uploadResult');
    
    if (!file) {
        showUploadResult('파일을 선택해주세요.', false);
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csvText = e.target.result;
            const newTeamData = parseCSV(csvText);
            
            // 기존 데이터를 새 데이터로 교체
            teamData = newTeamData;

            // localStorage에 저장
            if (saveTeamData(teamData)) {
                console.log('팀 데이터가 localStorage에 저장되었습니다.');
            } else {
                alert('데이터 저장에 실패했습니다. 브라우저 저장소를 확인해주세요.');
            }

            // 현재 팀 데이터 표시 업데이트
            displayCurrentTeams();
            
            // 검색 결과 초기화
            const resultSection = document.getElementById('result');
            const notFoundSection = document.getElementById('notFound');
            resultSection.classList.add('hidden');
            notFoundSection.classList.add('hidden');
            
            showUploadResult(`성공적으로 업로드되었습니다. 총 ${Object.keys(newTeamData).length}개 팀이 등록되었습니다.`, true);
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
    link.setAttribute('download', `팀데이터_${dateStr}.csv`);
    
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