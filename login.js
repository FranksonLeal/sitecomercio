document.addEventListener("DOMContentLoaded", function () {
  // Adiciona um listener para o evento de clique no botão "Entrar"
  document.getElementById("login-button").addEventListener("click", function(event) {
    event.preventDefault(); // Evita o comportamento padrão de submissão do formulário
    login();
  });

  // Adiciona um listener para o evento de clique no botão "Recuperar senha"
  document.getElementById("forgot-password-button").addEventListener("click", function() {
    // Exibir uma mensagem de confirmação para o usuário
    var confirmRecover = confirm("Tem certeza de que deseja solicitar a recuperação de senha?");

    if (confirmRecover) {
      // Se o usuário confirmar, chama a função para recuperar a senha
      recoverPassword();
    } else {
      // Se o usuário cancelar, exibe uma mensagem de cancelamento
      alert("Recuperação de senha cancelada.");
    }
  });

  // Habilita ou desabilita o botão de recuperar senha com base na validade do email
  document.getElementById("email").addEventListener("input", function() {
    toggleButtonsDisable();
  });
});

function login() {
  // Verifica se todos os campos obrigatórios estão preenchidos
  if (!isFormValid()) {
    return;
  }

  showLoading();
  const email = form.email().value;
  const password = form.password().value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((response) => {
      hideLoading();
      // Verifica se o usuário é o administrador
      if (response.user.email === "lealadm@gmail.com") {
        window.location.href = "painelControle.html";
      } else {
        window.location.href = "index.html";
      }
    })
    .catch((error) => {
      hideLoading();
      alert("Usuário não encontrado");
    });
}

function recoverPassword() {
  const email = form.email().value;
  firebase.auth().sendPasswordResetEmail(email)
    .then(() => {
      alert("Um email de recuperação de senha foi enviado para o seu endereço de email.");
    })
    .catch((error) => {
      alert("Ocorreu um erro ao enviar o email de recuperação de senha. Por favor, tente novamente.");
    });
}

function register() {
  showLoading();
  setTimeout(() => {
      hideLoading();
      window.location.href = "register.html";
  }, 1000); 
}

// Função para verificar se todos os campos obrigatórios estão preenchidos
function isFormValid() {
  const emailField = form.email();
  const passwordField = form.password();
  const email = emailField.value;
  const password = passwordField.value;
  let valid = true;

  // Remove a classe de erro antes de validar
  emailField.classList.remove("input-error");
  passwordField.classList.remove("input-error");

  if (!email) {
    emailField.classList.add("input-error"); // Adiciona a classe de erro
    valid = false;
  }

  if (!password) {
    passwordField.classList.add("input-error"); // Adiciona a classe de erro
    valid = false;
  }

  if (!valid) {
    alert("Por favor, preencha todos os campos.");
  }

  return valid;
}

const passwordInput = document.getElementById('password');
  const togglePasswordButton = document.getElementById('toggle-password');
  const passwordIcon = document.getElementById('password-icon');

  togglePasswordButton.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);

    // Alternar o ícone
    if (type === 'text') {
      passwordIcon.classList.remove('fa-eye');
      passwordIcon.classList.add('fa-eye-slash');
    } else {
      passwordIcon.classList.remove('fa-eye-slash');
      passwordIcon.classList.add('fa-eye');
    }
  });

// Função para habilitar ou desabilitar botões com base na validade do email
function toggleButtonsDisable() {
  const email = form.email().value;
  const recoverButton = document.getElementById("forgot-password-button");
  const loginButton = document.getElementById("login-button");

  if (email) {
    recoverButton.removeAttribute("disabled");
    loginButton.removeAttribute("disabled");
  } else {
    recoverButton.setAttribute("disabled", "true");
    loginButton.setAttribute("disabled", "true");
  }
}

const form = {
  email: () => document.getElementById("email"),
  loginButton: () => document.getElementById("login-button"),
  password: () => document.getElementById("password"),
  recoverPasswordButton: () =>
    document.getElementById("recover-password-button"),
};
