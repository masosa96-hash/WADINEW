// =============================
// CONFIGURACIÓN DE FIREBASE
// =============================
const firebaseConfig = {
  apiKey: "AIzaSyAweaSvXfHYyArsnjI-G7NhP82YP5Azu-g",
  authDomain: "kivo-8c62e.firebaseapp.com",
  projectId: "kivo-8c62e",
  storageBucket: "kivo-8c62e.appspot.com",
  messagingSenderId: "118749642871",
  appId: "1:118749642871:web:28a152eccf323981c64672",
  measurementId: "G-HQ4WK0N2XT",
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Firestore y Auth
const db = firebase.firestore();
const auth = firebase.auth();

// =============================
// AUTENTICACIÓN ANÓNIMA
// =============================
auth.signInAnonymously().catch((error) => {
  console.error("Error en autenticación anónima:", error);
});

// =============================
// INICIALIZACIÓN FIRESTORE
// =============================
async function inicializarFirestore(uid) {
  try {
    const docRef = db.collection("usuarios").doc(uid);

    await docRef.set(
      {
        perfil: { voz: "emocional" },
        historialEmocional: [
          {
            mensaje: "Inicio de historial emocional.",
            emocion: "neutral",
            modo: "emocional",
            etiqueta: "normal",
            timestamp: new Date().toISOString(),
          },
        ],
      },
      { merge: true }
    );

    console.log("Documento inicial creado correctamente.");
  } catch (err) {
    console.error("Error inicializando Firestore:", err);
  }
}

// =============================
// LISTENER DE AUTH
// =============================
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("Usuario autenticado:", user.uid);

    db.collection("usuarios")
      .doc(user.uid)
      .get()
      .then((doc) => {
        if (!doc.exists) inicializarFirestore(user.uid);
      });

    if (typeof cargarUsuario === "function") {
      cargarUsuario(user.uid);
    }
  }
});
