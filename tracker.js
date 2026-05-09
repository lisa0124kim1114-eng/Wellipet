// Wellipet 방문자 추적 스크립트
(function(){
  // 관리자 페이지는 추적하지 않음
  if(location.pathname.includes('admin.html')) return;

  var SUPABASE_URL='https://pzzunxgbzkhdqemmgavd.supabase.co';
  var SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6enVueGdiemtoZHFlbW1nYXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0OTU5NTAsImV4cCI6MjA4OTA3MTk1MH0.Rswsnz9WU5L7hzLD82iupeuizj-GnE4OJl42-QUv030';

  // 고유 방문자 ID (localStorage에 저장)
  var vid = localStorage.getItem('_wv');
  if(!vid){
    vid = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)+Date.now().toString(36);
    localStorage.setItem('_wv', vid);
  }

  var page = location.pathname.split('/').pop() || 'index.html';

  // 카카오 로그인 후 환영 카톡 발송
  if(window.supabase && window._supabase){
    window._supabase.auth.onAuthStateChange(function(event, session){
      if(event==='SIGNED_IN' && session && session.provider_token){
        // 이미 보낸 적 있으면 스킵
        var sentKey='_wk_sent_'+session.user.id;
        if(localStorage.getItem(sentKey)) return;
        localStorage.setItem(sentKey,'1');
        fetch(SUPABASE_URL+'/functions/v1/send-kakao-notification',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({type:'welcome_customer',provider_token:session.provider_token})
        }).catch(function(){});
      }
    });
  }

  fetch(SUPABASE_URL+'/rest/v1/page_views', {
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization':'Bearer '+SUPABASE_KEY,
      'Prefer':'return=minimal'
    },
    body: JSON.stringify({
      page: page,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      visitor_id: vid
    })
  }).catch(function(){});
})();
