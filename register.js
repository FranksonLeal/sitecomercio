function login() {
  showLoading();
  setTimeout(() => {
      hideLoading();
      window.location.href = "login.html";
  }, 1000); 
}

function register() {
  showLoading();

  // Obtenha os valores dos campos do formulário
  const email = form.email().value;
  const password = form.password().value;
  const nome = form.nome().value;
  const telefone = form.telefone().value;
  const endereco = form.endereco().value;

  // Verifique se todos os campos estão preenchidos
  if (!email || !password || !nome || !telefone || !endereco) {
      hideLoading();
      alert("Por favor, preencha todos os campos antes de prosseguir com o registro.");
      return;
  }

  // Se todos os campos estiverem preenchidos, continue com o processo de registro
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      const uid = user.uid;

      // Salvar informações adicionais no Firestore
      firebase.firestore().collection('clientes').doc(uid).set({
        nome: nome,
        email: email,
        telefone: telefone,
        endereco: endereco,
      }).then(() => {
        hideLoading();
        showSuccessMessage();
        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      }).catch((error) => {
        hideLoading();
        alert("Erro ao salvar informações adicionais do usuário: " + error);
      });
    }).catch((error) => {
      hideLoading();
      alert("Erro ao registrar usuário: " + error.message);
    });
}

function buscarEndereco(cep) {
  // Remove caracteres não numéricos do CEP
  cep = cep.replace(/\D/g, '');

  // Verifica se o CEP tem 8 dígitos
  if (cep.length === 8) {
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
          .then(response => response.json())
          .then(data => {
              if (!data.erro) {
                  // Preencher o campo de endereço com o resultado da API
                  document.getElementById('endereco').value = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
              } else {
                  alert('CEP não encontrado! Você pode preencher o endereço manualmente.');
                  document.getElementById('endereco').value = ''; // Limpa o campo se o CEP não for encontrado
              }
          })
          .catch(error => {
              console.error('Erro ao buscar o endereço:', error);
              alert('Erro ao buscar o endereço. Tente novamente mais tarde.');
          });
  } else {
      document.getElementById('endereco').value = ''; // Limpa o campo se o CEP não tiver 8 dígitos
  }
}

const passwordInput = document.getElementById('password');
const togglePasswordButton = document.getElementById('toggle-password');
const passwordIcon = document.getElementById('password-icon');

togglePasswordButton.addEventListener('click', () => {
  const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordInput.setAttribute('type', type);

  // Alterna o ícone
  if (type === 'text') {
    passwordIcon.classList.remove('fa-eye');
    passwordIcon.classList.add('fa-eye-slash');
  } else {
    passwordIcon.classList.remove('fa-eye-slash');
    passwordIcon.classList.add('fa-eye');
  }
});


const form = {
  email: () => document.getElementById('email'),
  password: () => document.getElementById('password'),
  registerButton: () => document.getElementById('register-button'),
  nome: () => document.getElementById('nome'),
  telefone: () => document.getElementById('telefone'),
  endereco: () => document.getElementById('endereco'),
};

// Adicionando o evento de "blur" para o campo de CEP
document.getElementById('cep').addEventListener('blur', function() {
  buscarEndereco(this.value);
});
