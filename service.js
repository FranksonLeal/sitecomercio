const db = firebase.firestore();
//Inicialize o Firebase Storage
const storage = firebase.storage();

const clientes = db.collection('clientes')
const produtos = db.collection('produtos')
const pedidos = db.collection('pedidos')