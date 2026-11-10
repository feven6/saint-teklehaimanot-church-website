import { firebaseConfig, configured } from './firebase-config.js';
const $ = id => document.getElementById(id);
const status = message => { $('status').textContent = message; };
if (configured) {
  try { await start(); } catch (err) { status('Portal unavailable: ' + err.message); }
}
async function start() {
  const [{ initializeApp }, auth, db] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js')
  ]);
  const app = initializeApp(firebaseConfig);
  const account = auth.getAuth(app), firestore = db.getFirestore(app);
  $('setupNotice').hidden = true; $('authSection').hidden = false;
  let user = null, admin = false;
  const safe = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const youtubeId = value => {
    try {
      const u = new URL(value);
      if (u.hostname === 'youtu.be') return /^[\w-]{11}$/.test(u.pathname.slice(1)) ? u.pathname.slice(1) : null;
      if (['youtube.com','www.youtube.com','m.youtube.com'].includes(u.hostname)) {
        const id = u.pathname.startsWith('/shorts/') ? u.pathname.split('/')[2] : u.searchParams.get('v');
        return /^[\w-]{11}$/.test(id ?? '') ? id : null;
      }
    } catch {}
    return null;
  };
  $('signupForm').addEventListener('submit', async e => {
    e.preventDefault();
    try {
      const credential = await auth.createUserWithEmailAndPassword(account, $('signupEmail').value.trim(), $('signupPassword').value);
      await auth.updateProfile(credential.user, { displayName: $('memberName').value.trim() });
      await auth.sendEmailVerification(credential.user);
      status('Account created. Check your email to verify your address before submitting media.');
      $('signupForm').reset();
    } catch (err) { status(err.message); }
  });
  $('signinForm').addEventListener('submit', async e => {
    e.preventDefault();
    try { await auth.signInWithEmailAndPassword(account, $('signinEmail').value.trim(), $('signinPassword').value); $('signinForm').reset(); }
    catch (err) { status(err.message); }
  });
  $('signoutButton').addEventListener('click', () => auth.signOut(account));
  $('sendVerificationButton').addEventListener('click', async () => {
    if (!user) return;
    try {
      await auth.sendEmailVerification(user);
      status('Verification email sent. Check your inbox and spam folder, then click the link in the email.');
    } catch (err) { status('Unable to send verification email: ' + err.message); }
  });
  $('checkVerificationButton').addEventListener('click', async () => {
    if (!user) return;
    try {
      await user.reload();
      await user.getIdToken(true);
      $('verificationActions').hidden = user.emailVerified;
      $('memberGreeting').textContent = 'Signed in as ' + (user.displayName || user.email) + (user.emailVerified ? '' : ' — verify your email to submit');
      status(user.emailVerified ? 'Email verified! You can now submit videos.' : 'Email is not verified yet. Open the verification link sent to your email.');
    } catch (err) { status('Unable to check verification: ' + err.message); }
  });

  auth.onAuthStateChanged(account, async next => {
    user = next; admin = false;
    $('authSection').hidden = !!user;
    $('memberSection').hidden = !user;
    $('adminSection').hidden = true;
    if (user) {
      await user.reload();
      $('verificationActions').hidden = user.emailVerified;
      $('memberGreeting').textContent = 'Signed in as ' + (user.displayName || user.email) + (user.emailVerified ? '' : ' — verify your email to submit');
      try { admin = (await db.getDoc(db.doc(firestore,'admins',user.uid))).exists(); } catch {}
      $('adminSection').hidden = !admin;
      try {
        await loadMine();
      } catch (err) {
        status('Unable to load your submissions: ' + err.message);
      }
      if (admin) {
        try {
          await loadQueue();
        } catch (err) {
          status('Unable to load administrator queue: ' + err.message);
        }
      }
    }
    // The public gallery must load even if a member/admin query fails.
    await loadApproved();
  });
  $('submitForm').addEventListener('submit', async e => {
    e.preventDefault();
    if (!user) return;
    try {
      await user.reload();
      if (!user.emailVerified) throw new Error('Verify your email before submitting.');
      await user.getIdToken(true);
      const type = $('mediaType').value, title = $('mediaTitle').value.trim(), description = $('mediaDescription').value.trim();
      const docRef = db.doc(db.collection(firestore,'submissions'));
      const data = { ownerId:user.uid, ownerName:user.displayName || 'Church member', title, description, type, status:'pending', createdAt:db.serverTimestamp() };
      if (type !== 'video') throw new Error('Only YouTube video links are currently supported.');
      const id = youtubeId($('videoUrl').value);
      if (!id) throw new Error('Enter a valid YouTube video URL.');
      data.videoId = id;
      await db.setDoc(docRef,data);
      $('submitForm').reset();
      status('Submitted! An administrator will review your media before publication.');
      await loadMine(); if (admin) await loadQueue();
    } catch(err) { status(err.message); }
  });
  
function renderItem(item) {
  const d = item.data();
  const wrapper = document.createElement('div');

  wrapper.className = 'submission';

  wrapper.innerHTML =
    '<strong>' + safe(d.title) + '</strong> ' +
    '<small>(' + safe(d.status) + ')</small>' +
    '<p>' + safe(d.description || '') + '</p>';

  // Add a video link for administrators and members.
  if (d.type === 'video' &&
      d.videoId &&
      /^[A-Za-z0-9_-]{11}$/.test(d.videoId)) {

    const link = document.createElement('a');
    link.href = 'https://www.youtube.com/watch?v=' + d.videoId;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = '▶ Watch on YouTube';

    wrapper.appendChild(link);
  }

  return wrapper;
}

  async function loadMine() {
    if (!user) return;
    const result = await db.getDocs(db.query(db.collection(firestore,'submissions'),db.where('ownerId','==',user.uid)));
    $('mySubmissions').replaceChildren(...result.docs.map(renderItem));
  }
  async function loadQueue() {
    const result = await db.getDocs(db.query(db.collection(firestore,'submissions'),db.where('status','==','pending')));
    const elements = result.docs.map(doc => {
      const node = renderItem(doc);
      for (const action of ['approved','rejected']) {
        const button = document.createElement('button');
        button.className = 'btn btn-outline';
        button.textContent = action === 'approved' ? 'Approve' : 'Reject';
        button.addEventListener('click',async () => {
          try {
            await db.updateDoc(doc.ref,{status:action,reviewedBy:user.uid,reviewedAt:db.serverTimestamp()});
            status('Submission '+action+'.'); await loadQueue(); await loadApproved();
          } catch(err) { status(err.message); }
        });
        node.append(button);
      }
      return node;
    });
    $('reviewQueue').replaceChildren(...elements);
  }
  async function loadApproved() {
    try {
      const result = await db.getDocs(db.query(db.collection(firestore,'submissions'),db.where('status','==','approved')));
      const nodes = await Promise.all(result.docs.map(async doc => {
        const d = doc.data(), node = document.createElement('article');
        node.className = 'portal-card';
        const h = document.createElement('h3'); h.textContent = d.title; node.append(h);
        const p = document.createElement('p'); p.textContent = d.description || ''; node.append(p);
        if (d.type === 'video' && d.videoId && /^[\w-]{11}$/.test(d.videoId)) {
          const a = document.createElement('a'); a.href='https://www.youtube.com/watch?v='+d.videoId; a.target='_blank'; a.rel='noopener noreferrer'; a.textContent='Watch on YouTube'; node.append(a);
        }
        return node;
      }));
      $('approvedGallery').replaceChildren(...nodes);
    } catch(err) { status('Unable to load approved gallery: '+err.message); }
  }
}
