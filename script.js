// Inicialização do Firebase e definição da variável db
const firebaseConfig = {
  apiKey: "AIzaSyDFFMSdx5Z9bW545lVFnQrL78Q4gcUwpuI",
  authDomain: "site-comercio.firebaseapp.com",
  projectId: "site-comercio",
  storageBucket: "site-comercio.appspot.com",
  messagingSenderId: "862171238249",
  appId: "1:862171238249:web:93a346f555a5d6f68177f8",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

document.addEventListener("DOMContentLoaded", function () {
  const loginModal = document.getElementById("authModal");
  const finalizarCompraModal = document.getElementById("finalizarCompraModal");
  const closeFinalizarCompraModalBtn = document.getElementById(
    "closeFinalizarCompraModalBtn"
  );
  const finalizarCompraBtn = document.getElementById("finalizar-compra-btn");
  const enviarPedidoBtn = document.getElementById("enviar-pedido-btn");
  const nomeUsuarioInput = document.getElementById("nome-usuario");
  const enderecoUsuarioInput = document.getElementById("endereco-usuario");

  finalizarCompraBtn.addEventListener("click", function () {
    const user = firebase.auth().currentUser;

    if (user) {
      const userId = user.uid; // Obter o ID do usuário autenticado
      console.log("UID do usuário autenticado:", userId); // Exibir o UID no console

      // Recuperar o nome e endereço do Firestore
      const userDocRef = firebase.firestore().collection('clientes').doc(userId);

      userDocRef.get().then((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          console.log("Dados do usuário encontrados no Firestore:", userData);
          nomeUsuarioInput.value = userData.nome || user.displayName || ""; // Usar o nome do Firestore ou do Authentication
          enderecoUsuarioInput.value = userData.endereco || ""; // Usar o endereço do Firestore
        } else {
          console.log("Nenhum documento encontrado para o usuário no Firestore.");
          nomeUsuarioInput.value = user.displayName || ""; // Caso o Firestore não tenha nome, usar o do Authentication
          enderecoUsuarioInput.value = ""; // Deixar vazio se não houver endereço
        }

        // Abrir modal de finalizar compra
        finalizarCompraModal.style.display = "block";
      }).catch((error) => {
        console.error("Erro ao buscar dados do usuário no Firestore:", error);
      });
    } else {
      // Usuário não autenticado, exibir janela de login
      loginModal.style.display = "block";
    }

    // Chamada da função para calcular e exibir o total da compra no modal
    calcularTotalCompraModal();
  });


  closeFinalizarCompraModalBtn.addEventListener("click", function () {
    finalizarCompraModal.style.display = "none";
  });

  // Fechar a janela modal quando clicar fora dela
  window.addEventListener("click", function (event) {
    if (event.target == finalizarCompraModal) {
      finalizarCompraModal.style.display = "none";
    }
  });

  // Variáveis para armazenar os dados do formulário
  let nomeEnviado = "";
  let enderecoEnviado = "";
  let tipoPagamentoEnviado = "";

  // Event listener para enviar pedido
  enviarPedidoBtn.addEventListener("click", function () {
    // Obter os dados do formulário
    const nome = nomeUsuarioInput.value;
    const endereco = enderecoUsuarioInput.value;
    const tipoPagamento = document.getElementById("tipo-pagamento").value;

    if (
      nome.trim() === "" ||
      endereco.trim() === "" ||
      tipoPagamento.trim() === ""
    ) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    let mensagem = `Olá, meu nome é ${nome} e gostaria de fazer um pedido com entrega em: ${endereco}.`;

    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    cartItems.forEach((item, index) => {
      mensagem += `\nProduto ${index + 1}: ${item.nome}, Preço: R$ ${item.preco
        }, Quantidade: ${item.quantidade || 1}`;
    });

    // Adicionar o total da compra
    const totalCompra = document.getElementById("total").textContent;
    mensagem += `\nTotal da Compra: ${totalCompra}`;

    mensagem += `\nTipo de Pagamento: ${tipoPagamento}`;

    const urlWhatsApp = `https://api.whatsapp.com/send?phone=92991149103&text=${encodeURIComponent(
      mensagem
    )}`;

    window.open(urlWhatsApp, "_blank");
  });

  // Event listener para o botão "Finalizar"
  const irParaLoginBtnModalFinalizarCompra =
    document.getElementById("finalizar");
  irParaLoginBtnModalFinalizarCompra.addEventListener("click", function () {
    alert("Seu pedido foi enviado ao proprietário. Aguarde que você receberá um retorno sobre o seu pedido pelo WhatsApp.");

    finalizarCompraModal.style.display = "none";
  });

  // Event listener para abrir o modal de finalizar compra
  finalizarCompraBtn.addEventListener("click", function () {
    const user = firebase.auth().currentUser;
    if (user) {
      // Usuário autenticado

      nomeUsuarioInput.value = user.displayName || "";
      enderecoUsuarioInput.value = user.address || "";

      document.getElementById("tipo-pagamento").value = tipoPagamentoEnviado;

      finalizarCompraModal.style.display = "block";
    } else {
      loginModal.style.display = "block";
    }
  });

  // Função para calcular e exibir o total da compra no modal
  function calcularTotalCompraModal() {
    const totalCompra = document.getElementById("total").textContent;
    const totalCompraModal = document.getElementById("total-compra-modal");
    totalCompraModal.textContent = `Total da Compra: ${totalCompra}`;
  }

  // Event listener para redirecionar o usuário para a página de login
  const irParaLoginBtn = document.getElementById("loginModalBtn");
  irParaLoginBtn.addEventListener("click", function () {
    window.location.href = "login.html";
  });

  var modal2 = document.getElementById("authModal");

  var closeModalBtn = document.getElementById("closeModalBtn");

  // Fechar o modal ao clicar no botão de fechar
  closeModalBtn.addEventListener("click", function () {
    modal2.style.display = "none";
  });

  // Verificar se o usuário está autenticado
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log("Usuário autenticado:", user);

      loginModal.style.display = "none";
    } else {
      console.log("Usuário não autenticado.");
    }
  });

  let cartItemCount = parseInt(localStorage.getItem("cartItemCount")) || 0;

  function updateCartNotification() {
    const cartNotification = document.getElementById("cart-notification");
    cartNotification.textContent = cartItemCount;
    if (cartItemCount > 0) {
      cartNotification.style.display = "block";
    } else {
      cartNotification.style.display = "none";
    }
    console.log("Cart Item Count (Notification):", cartItemCount);
  }

  function updateCartIconNotification() {
    const cartIcon = document.getElementById("cart-btn");
    cartIcon.setAttribute("data-count", cartItemCount > 0 ? cartItemCount : "");
    console.log("Cart Item Count (Icon):", cartItemCount);
  }

  function adicionarAoCarrinho(product) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Verificar se o produto já está no carrinho
    const produtoIndex = cart.findIndex(item => item.id === product.id);
    if (produtoIndex !== -1) {
      // Se o produto já estiver no carrinho, apenas incrementar a quantidade
      alert("Este produto já está no carrinho");
      return;
    } else {
      // Se o produto não estiver no carrinho, adicionar como um novo item
      product.quantidade = 1; // Adiciona quantidade inicial ao produto
      cart.push(product);
    }

    // Atualizar os dados do carrinho no localStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    // Atualizar a contagem correta de itens no carrinho
    cartItemCount++;
    localStorage.setItem("cartItemCount", cartItemCount);

    // Atualizar as notificações e exibir os produtos no carrinho
    updateCartNotification();
    updateCartIconNotification();
    exibirProdutosNoCarrinho();
    calcularTotalCompra();
  }


  // Função para exibir os produtos na seção "menu"
  function exibirProdutos() {
    const menuContainer = document.getElementById("produtos");
    menuContainer.innerHTML = "";

    const sectionTitle = document.querySelector(".menu .heading");
    if (sectionTitle) {
      sectionTitle.style.display = "block";
    }

    db.collection("produtos")
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.size === 0) {
          const noProductsMessage = document.createElement("p");
          noProductsMessage.textContent =
            "Não há produtos disponíveis no momento.";
          noProductsMessage.classList.add("no-products-message");
          menuContainer.appendChild(noProductsMessage);
        } else {
          querySnapshot.forEach((doc) => {
            const produto = doc.data();
            const productBox = document.createElement("div");
            productBox.classList.add("box-container");

            const productImage = document.createElement("img");
            productImage.src = produto.imagem;
            productImage.alt = produto.nome;

            const productName = document.createElement("h3");
            productName.textContent = produto.nome;

            const productPrice = document.createElement("p");
            if (
              produto.preco !== undefined &&
              !isNaN(parseFloat(produto.preco))
            ) {
              productPrice.textContent = `Preço: R$ ${parseFloat(
                produto.preco
              ).toFixed(2)}`;
            } else {
              productPrice.textContent = "Preço indisponível";
            }

            const addToCartBtn = document.createElement("button");
            addToCartBtn.classList.add("btn");
            addToCartBtn.textContent = "Adicionar ao Carrinho";

            productBox.appendChild(productImage);
            productBox.appendChild(productName);
            productBox.appendChild(productPrice);
            productBox.appendChild(addToCartBtn);

            menuContainer.appendChild(productBox);

            addToCartBtn.addEventListener("click", () => {
              const productDetails = {
                id: doc.id,
                nome: produto.nome,
                imagem: produto.imagem,
                preco: produto.preco,
              };
              adicionarAoCarrinho(productDetails);
            });
          });
        }
      });
  }

  const addToCartBtns = document.querySelectorAll(
    ".menu .box-container button"
  );
  addToCartBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const productDetails = {
        nome: btn.parentNode.querySelector("h3").textContent,
        imagem: btn.parentNode.querySelector("img").src,
        preco: btn.parentNode
          .querySelector("p")
          .textContent.replace("Preço: R$ ", ""),
        quantidade: 1,
      };
      adicionarAoCarrinho(productDetails);
    });
  });



  function updateQuantidade(index, newQuantity) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (newQuantity > 0) {
      cart[index].quantidade = newQuantity;
      localStorage.setItem("cart", JSON.stringify(cart));
      exibirProdutosNoCarrinho(); // Atualiza a exibição
      calcularTotalCompra(); // Recalcula o total
      updateCartNotification(); // Atualiza a notificação
    }
  }


  function debounce(func, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  const debouncedHandleQuantityChange = debounce(handleQuantityChange, 300);


  function handleQuantityChange(index, event) {
    const newQuantity = parseInt(event.target.value);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      updateQuantidade(index, newQuantity);
    } else {
      // Restaura o valor anterior se a entrada for inválida
      const cart = JSON.parse(localStorage.getItem("cart"));
      event.target.value = cart[index].quantidade || 1;
    }
  }









  // Definindo a função no escopo global
  window.exibirProdutosNoCarrinho = function () {
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    const carrinhoTableBody = document.getElementById("cart-items");
    carrinhoTableBody.innerHTML = "";

    if (cartItems.length === 0) {
      const noItemsMessage = document.createElement("tr");
      noItemsMessage.innerHTML = `<td colspan="5">Não há produtos adicionados no seu carrinho</td>`;
      carrinhoTableBody.appendChild(noItemsMessage);
    } else {
      cartItems.forEach((product, index) => {
        const newRow = document.createElement("tr");

        const productImageCell = document.createElement("td");
        if (product.imagem) {
          const productImage = document.createElement("img");
          productImage.src = product.imagem;
          productImage.alt = product.nome;
          productImage.style.height = "10rem";
          productImageCell.appendChild(productImage);
        } else {
          productImageCell.textContent = "Imagem não disponível";
        }
        newRow.appendChild(productImageCell);

        const productNameCell = document.createElement("td");
        productNameCell.textContent = product.nome;
        newRow.appendChild(productNameCell);

        const productPriceCell = document.createElement("td");
        productPriceCell.textContent = `R$ ${parseFloat(product.preco).toFixed(2)}`;
        newRow.appendChild(productPriceCell);

        const productQuantityCell = document.createElement("td");
        const quantityContainer = document.createElement("div");
        quantityContainer.style.display = "flex";
        quantityContainer.style.flexDirection = "column";
        quantityContainer.style.alignItems = "center";

        quantityContainer.innerHTML = `
              <div class="qty" style="display: flex; align-items: center;">
                  <button class="decrement" data-index="${index}"><i class="bx bx-minus"></i></button>
                  <span>${product.quantidade || 1}</span>
                  <button class="increment" data-index="${index}"><i class="bx bx-plus"></i></button>
              </div>
          `;

        const quantityInput = document.createElement("input");
        quantityInput.type = "number";
        quantityInput.classList.add("quantity");
        quantityInput.value = product.quantidade || 1;
        quantityInput.min = 1;
        quantityInput.style.border = "1px solid #ccc";
        quantityInput.style.padding = "5px";
        quantityInput.style.fontSize = "14px";
        quantityInput.style.width = "60px";
        quantityInput.style.textAlign = "center";
        quantityInput.style.marginTop = "15px";
        quantityInput.placeholder = "Ou digite";

        quantityContainer.appendChild(quantityInput);
        productQuantityCell.appendChild(quantityContainer);
        newRow.appendChild(productQuantityCell);

        const productTotalCell = document.createElement("td");
        const totalValue = parseFloat(product.preco) * (product.quantidade || 1);
        productTotalCell.textContent = `R$ ${totalValue.toFixed(2)}`;
        newRow.appendChild(productTotalCell);

        const removeButtonCell = document.createElement("td");
        const removeButton = document.createElement("button");
        removeButton.classList.add("remove");
        removeButton.innerHTML = `<i class="bx bx-x"></i>`;
        removeButton.dataset.index = index;
        removeButtonCell.appendChild(removeButton);
        newRow.appendChild(removeButtonCell);

        carrinhoTableBody.appendChild(newRow);

        removeButton.addEventListener("click", () => {
          removerDoCarrinho(index);
          atualizarCarrinho(); // Atualiza a interface
        });

        const incrementButton = newRow.querySelector(".increment");
        const decrementButton = newRow.querySelector(".decrement");
        incrementButton.addEventListener("click", () => {
          incrementarQuantidade(index);
        });
        decrementButton.addEventListener("click", () => {
          decrementarQuantidade(index);
        });

        quantityInput.addEventListener("change", (event) => {
          const newQuantity = Math.max(1, parseInt(event.target.value));
          cartItems[index].quantidade = newQuantity;
          localStorage.setItem("cart", JSON.stringify(cartItems));
          atualizarCarrinho();
        });
      });
    }
  }

  // Chama a função para exibir os produtos no carrinho quando a página carrega
  window.exibirProdutosNoCarrinho();


  // Função para incrementar a quantidade do produto no carrinho
  function incrementarQuantidade(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart[index].quantidade = (cart[index].quantidade || 1) + 1;
    localStorage.setItem("cart", JSON.stringify(cart));
    atualizarCarrinho(); // Atualiza a interface
  }

  // Função para decrementar a quantidade do produto no carrinho
  function decrementarQuantidade(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart[index].quantidade && cart[index].quantidade > 1) {
      cart[index].quantidade -= 1;
      localStorage.setItem("cart", JSON.stringify(cart));
      atualizarCarrinho(); // Atualiza a interface
    }
  }


  // function removerDoCarrinho(index) {
  //   let cart = JSON.parse(localStorage.getItem("cart")) || [];

  //   // Remover o item do carrinho
  //   cart.splice(index, 1);
  //   localStorage.setItem("cart", JSON.stringify(cart));

  //   // Atualizar a contagem corretamente
  //   cartItemCount = cart.length;
  //   localStorage.setItem("cartItemCount", cartItemCount);

  //   exibirProdutosNoCarrinho(); // Atualiza a exibição do carrinho
  //   calcularTotalCompra(); // Recalcula o total
  //   updateCartNotification(); // Atualiza as notificações
  // }

  function removerDoCarrinho(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    // Verifica se o índice é válido
    if (index >= 0 && index < cart.length) {
      // Remover o item do carrinho
      cart.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cart));

      // Atualizar a contagem corretamente
      cartItemCount = cart.length;
      localStorage.setItem("cartItemCount", cartItemCount);

      // Atualiza a exibição do carrinho
      exibirProdutosNoCarrinho();
      calcularTotalCompra(); // Recalcula o total
      updateCartNotification(); // Atualiza as notificações
    } else {
      console.error("Índice inválido para remoção do carrinho:", index);
    }
  }









  function atualizarCarrinho() {
    exibirProdutosNoCarrinho();
    calcularTotalCompra();
    updateCartNotification();
  }



  function atualizarLocalStorage() {
    const cartRows = document.querySelectorAll("#cart-items tr");
    const cart = [];
    cartRows.forEach((row) => {
      const product = {
        nome: row.children[1].textContent,
        preco: parseFloat(row.children[2].textContent.replace("R$ ", "")),
        quantidade: parseInt(row.querySelector(".qty span").textContent),
      };
      cart.push(product);
    });
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  exibirProdutosNoCarrinho();

  // Event listener para remover o produto do carrinho
  document
    .getElementById("cart-items")
    .addEventListener("click", function (event) {
      if (event.target.classList.contains("remove")) {
        const row = event.target.closest("tr");
        const index = parseInt(event.target.dataset.index);
        removerDoCarrinho(index);
        atualizarLocalStorage();
      }
    });

  const userIcon = document.getElementById("user-profile");
  const userModal = document.getElementById("userModal");
  const closeBtn = document.querySelector("#userModal .close");
  const logoutBtn = document.getElementById("logoutBtn");
  const viewProfileBtn = document.getElementById("viewProfileBtn");

  // Função para atualizar o ícone do usuário
  // Função para atualizar o ícone do usuário
  function updateUserIcon() {
    const currentUser = firebase.auth().currentUser;
    const userProfileDiv = document.getElementById("user-profile");
    const entrarBtn = document.getElementById("entrarbtn");

    if (currentUser) {
      const userId = currentUser.uid; // ID do usuário autenticado
      const userRef = firebase.firestore().collection("clientes").doc(userId); // Referência ao documento do usuário

      userRef.get().then((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          const displayName = userData.nome; // Nome do usuário que você quer usar

          // Extrai as iniciais (primeira e segunda letra do nome)
          const nameParts = displayName.split(" ");
          const initials = nameParts.length > 1
            ? nameParts[0].charAt(0).toUpperCase() + nameParts[1].charAt(0).toUpperCase()
            : nameParts[0].charAt(0).toUpperCase(); // Usa apenas a primeira letra se não houver segundo nome

          userProfileDiv.textContent = initials; // Define o conteúdo do círculo
          userProfileDiv.style.display = "flex"; // Mostra o ícone
          entrarBtn.style.display = "none"; // Esconde o botão "Entrar"
        } else {
          console.log("Dados do usuário não encontrados.");
          userProfileDiv.textContent = "U"; // Fallback caso não encontre dados
          userProfileDiv.style.display = "flex"; // Mostra o ícone
          entrarBtn.style.display = "none"; // Esconde o botão "Entrar"
        }
      }).catch((error) => {
        console.error("Erro ao obter os dados do usuário:", error);
        userProfileDiv.textContent = "U"; // Fallback caso ocorra um erro
        userProfileDiv.style.display = "flex"; // Mostra o ícone
        entrarBtn.style.display = "none"; // Esconde o botão "Entrar"
      });
    } else {
      // Se o usuário não está autenticado, oculta o círculo e mostra o botão "Entrar"
      userProfileDiv.style.display = "none"; // Esconde o ícone
      entrarBtn.style.display = "inline-block"; // Mostra o botão "Entrar"
    }
  }

  // Chame essa função após verificar o estado de autenticação
  firebase.auth().onAuthStateChanged(function (user) {
    updateUserIcon(); // Atualiza o ícone com base no estado de autenticação
  });


  // Adiciona um evento de clique ao círculo do usuário para abrir o modal se o usuário estiver autenticado
  userIcon.addEventListener("click", function () {
    const currentUser = firebase.auth().currentUser;

    // Verifica se o usuário está autenticado
    if (currentUser) {
      // Abre o modal se o usuário estiver autenticado
      userModal.style.display = "block";
    } else {
      // Exibe uma mensagem se o usuário não estiver autenticado
      alert("Você precisa fazer login para acessar suas informações de usuário.");
    }
  });



  closeBtn.addEventListener("click", function () {
    userModal.style.display = "none";
  });

  logoutBtn.addEventListener("click", function () {
    // Exibir uma mensagem de confirmação para o usuário
    var confirmLogout = confirm("Tem certeza de que deseja sair? Ao sair você sairá do sistema e não conseguirá usar todas as funcionalidades do sistema");

    if (confirmLogout) {
      firebase
        .auth()
        .signOut()
        .then(function () {
          // Logout bem-sucedido
          alert("Você saiu do sistema.");
        })
        .catch(function (error) {
          var errorCode = error.code;
          var errorMessage = error.message;

          alert(errorMessage);
        });
    } else {
      alert("Logout cancelado.");
    }
  });

  // Inicialização do Firebase
  firebase.initializeApp(firebaseConfig);

  // Event listener para o botão "Ver Dados Cadastrais"
  viewProfileBtn.addEventListener("click", function () {
    console.log("Botão 'Ver Dados Cadastrais' clicado.");

    // Exibir o modal
    document.getElementById("userDataModal").style.display = "block";

    const user = firebase.auth().currentUser;
    if (user) {
      console.log("Usuário autenticado:", user);

      // Usuário está autenticado, obter os dados do usuário do Firestore
      const userId = user.uid;
      const userRef = firebase.firestore().collection("clientes").doc(userId);

      // Obter os dados do usuário do Firestore
      userRef
        .get()
        .then((doc) => {
          if (doc.exists) {
            console.log("Dados do usuário encontrados no Firestore:", doc.data());

            const userData = doc.data();

            // Preencher os campos do modal com os dados do usuário
            document.getElementById("nome").value = userData.nome;
            document.getElementById("telefone").value = userData.telefone;
            document.getElementById("endereco").value = userData.endereco;


            // Preencher o campo de email com o email do usuário autenticado
            document.getElementById("emaill").value = userData.email;
          } else {
            alert("Os dados do usuário não foram encontrados.");
          }
        })
        .catch((error) => {
          console.error("Erro ao obter os dados do usuário:", error);
          alert("Erro ao obter os dados do usuário. Por favor, tente novamente mais tarde.");
        });
    } else {
      console.log("Usuário não autenticado.");

      const confirmLogin = confirm(
        "Você não está autenticado. Deseja fazer login agora?"
      );
      if (confirmLogin) {
        window.location.href = "login.html";
      } else {
        alert(
          "Você não está autenticado. Você pode fazer login mais tarde para visualizar seus dados ou se cadastrar."
        );
      }
    }
  });

  // Event listener para o botão de fechar o modal
  document.querySelector("#userDataModal .close3").addEventListener("click", function () {
    document.getElementById("userDataModal").style.display = "none";
  });

  // Event listener para o botão "Editar"
  document.getElementById("editButton").addEventListener("click", function () {
    const formFields = document.querySelectorAll("#userDataForm input");
    formFields.forEach((field) => {
      field.removeAttribute("readonly");
    });

    document.getElementById("editButton").style.display = "none";
    document.getElementById("saveButton").style.display = "inline-block";
  });

  // Event listener para o botão "Salvar"
  document
    .getElementById("saveButton")
    .addEventListener("click", function (event) {
      event.preventDefault();

      const formFields = document.querySelectorAll("#userDataForm input");
      formFields.forEach((field) => {
        field.setAttribute("readonly", true);
      });

      document.getElementById("saveButton").style.display = "none";
      document.getElementById("editButton").style.display = "inline-block";
      // Salvar os dados do usuário no Firestore
      const user = firebase.auth().currentUser;
      if (user) {
        const userId = user.uid;
        const userRef = firebase.firestore().collection("clientes").doc(userId);
        const userData = {
          nome: document.getElementById("nome").value,
          email: document.getElementById("email").value,
          telefone: document.getElementById("telefone").value,
          endereco: document.getElementById("endereco").value,
        };
        // Atualizar os dados do usuário no Firestore
        userRef
          .set(userData, { merge: true })
          .then(() => {
            alert("Dados salvos com sucesso!");
          })
          .catch((error) => {
            console.error("Erro ao salvar os dados do usuário:", error);
            alert(
              "Erro ao salvar os dados do usuário. Por favor, tente novamente mais tarde."
            );
          });
      }
    });

  // Fechar a janela modal quando clicar fora dela
  window.addEventListener("click", function (event) {
    if (event.target == userModal) {
      userModal.style.display = "none";
    }
  });

  function calcularTotalCompra() {
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    let subtotal = 0;

    cartItems.forEach((item) => {
      subtotal += parseFloat(item.preco) * (item.quantidade || 1);
    });

    const subtotalElement = document.getElementById("subtotal");
    subtotalElement.textContent = `R$ ${subtotal.toFixed(2)}`;

    const totalElement = document.getElementById("total");
    totalElement.textContent = `R$ ${subtotal.toFixed(2)}`;
  }

  exibirProdutos();
  updateCartNotification();
  updateCartIconNotification();
  calcularTotalCompra();
});

document.getElementById("openMissionVisionValues").addEventListener("click", function () {
  var modal = document.getElementById("missionVisionValuesModal");
  modal.classList.add("active"); // Adiciona a classe "active" para exibir o modal
});

document.querySelector("#missionVisionValuesModal .close8").addEventListener("click", function () {
  var modal = document.getElementById("missionVisionValuesModal");
  modal.classList.remove("active"); // Remove a classe "active" para ocultar o modal
});





window.addEventListener("click", function (event) {
  var modal = document.getElementById("missionVisionValuesModal");
  if (event.target === modal) {
    modal.classList.remove("active"); // Remove a classe "active" se clicar fora do conteúdo do modal
  }
});



// Verifica o estado de autenticação do usuário quando a página é carregada
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // Se o usuário estiver autenticado, esconda o botão "entrarbtn"
    document.getElementById("entrarbtn").style.display = "none";
  } else {
    // Se o usuário não estiver autenticado, exiba o botão "entrarbtn"
    document.getElementById("entrarbtn").style.display = "block";
  }
});

// Adiciona um listener para o evento de clique no botão "entrar"
document.getElementById("entrarbtn").addEventListener("click", function () {
  // Redireciona para a página de login
  window.location.href = "login.html";
});








// Event listener para o botão "Finalizar"
const finalizarBtn = document.getElementById("finalizar");
finalizarBtn.addEventListener("click", function () {
  // Verificar se o usuário está autenticado
  const user = firebase.auth().currentUser;
  if (!user) {
    console.log("Você precisa fazer login no sistema.");
    // Aqui você pode exibir uma mensagem de erro ou redirecionar para a página de login
    return;
  }

  // Capturar os dados do formulário
  const nome = document.getElementById("nome-usuario").value;
  const endereco = document.getElementById("endereco-usuario").value;
  const tipoPagamento = document.getElementById("tipo-pagamento").value;

  // Verificar se todos os campos obrigatórios foram preenchidos
  if (!nome || !endereco || !tipoPagamento) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  // Capturar os itens do carrinho do localStorage
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

  // Calcular o valor total do pedido
  let totalPedido = 0;
  cartItems.forEach(item => {
    totalPedido += parseFloat(item.preco) * (item.quantidade || 1);
  });

  // Objeto com os dados do pedido, incluindo o ID do usuário e a data atual
  const pedido = {
    userID: user.uid, // ID do usuário autenticado
    nome: nome,
    endereco: endereco,
    tipoPagamento: tipoPagamento,
    produtos: cartItems,
    total: totalPedido,
    data: firebase.firestore.FieldValue.serverTimestamp() // Adiciona a data atual
  };

  // Adicionar o pedido ao banco de dados
  db.collection("pedidos").add(pedido)
    .then(function (docRef) {
      console.log("Pedido adicionado com ID: ", docRef.id);
      alert("Seu pedido foi enviado com sucesso!");
    })
    .catch(function (error) {
      console.error("Erro ao adicionar pedido: ", error);
      alert("Ocorreu um erro ao enviar seu pedido. Por favor, tente novamente mais tarde.");
    });

  // Fechar o modal de finalizar compra
  finalizarCompraModal.style.display = "none";
});








// Função para excluir um pedido
function deleteOrder(orderId) {
  // Confirmar se o usuário realmente deseja excluir o histórico
  const confirmDelete = confirm("Tem certeza de que deseja excluir este histórico?");

  // Se o usuário confirmar a exclusão
  if (confirmDelete) {
    // Excluir o histórico
    db.collection("pedidos").doc(orderId).delete().then(() => {
      alert("Histórico excluído com sucesso.");
      // Recarregar o histórico após a exclusão
      document.getElementById("viewHistoricBtn").click();
    }).catch((error) => {
      console.error("Erro ao excluir histórico:", error);
      alert("Erro ao excluir histórico. Por favor, tente novamente mais tarde.");
    });
  }
}


document.getElementById("viewHistoricBtn").addEventListener("click", function () {
  // Fechar o modal anterior se estiver aberto
  const previousModal = document.querySelector(".modal12[style='display: block;']");
  if (previousModal) {
    previousModal.style.display = "none";
  }

  const user = firebase.auth().currentUser;
  if (user) {
    console.log("Usuário autenticado. Recuperando histórico de compras...");
    // Usuário autenticado, recuperar o histórico de compras associado a este usuário
    const userId = user.uid;
    const userOrdersRef = db.collection("pedidos").where("userID", "==", userId);

    userOrdersRef.get().then((querySnapshot) => {
      console.log("Consulta realizada com sucesso. Total de documentos encontrados:", querySnapshot.size);
      // Limpar o conteúdo anterior do modal
      document.getElementById("historicDetails").innerHTML = "";

      if (querySnapshot.empty) {
        console.log("Nenhum histórico de compras encontrado para este usuário.");
        const historicDetails = document.getElementById("historicDetails");
        historicDetails.innerHTML = "<p>Não há histórico de compras disponível no momento.</p>";
      } else {
        console.log("Exibindo histórico de compras...");
        // Exibir os pedidos do usuário na interface do usuário
        querySnapshot.forEach((doc) => {
          const orderData = doc.data();
          // Verificar se o campo de data está presente antes de tentar convertê-lo
          const orderDate = orderData.data ? formatDate(orderData.data.toDate()) : "Data não disponível";

          // Aqui você pode exibir os detalhes do pedido na interface do usuário
          const historicDetails = document.getElementById("historicDetails");
          const orderElement = document.createElement("div");
          orderElement.classList.add("historic-row");
          orderElement.innerHTML = `
                      <div class="historic-info">
                          <p class="historic-title"><strong>Data:</strong> ${orderDate}</p>
                          <div class="historic-details">
                              <p><strong>Produtos:</strong></p>
                              <ul class="historic-products">
                                  ${orderData.produtos.map(produto => `<li><span class="historic-product-name">${produto.nome}</span> - <span class="historic-product-quantity">${produto.quantidade}</span></li>`).join('')}
                              </ul>
                              <p class="historic-total"><strong>Total:</strong> ${orderData.total}</p>
                          </div>
                      </div>
                      <div class="historic-delete">
                          <span class="delete-order" data-order-id="${doc.id}" style="cursor: pointer;">&times;</span>
                      </div>
                      <hr>
                  `;
          historicDetails.appendChild(orderElement);
        });

        // Adicionar evento de clique para excluir histórico
        const deleteOrderButtons = document.querySelectorAll(".delete-order");
        deleteOrderButtons.forEach(button => {
          button.addEventListener("click", function (event) {
            const orderId = event.target.getAttribute("data-order-id");
            deleteOrder(orderId);
          });
        });
      }

      // Exibir o modal
      const modal = document.getElementById("historicModal");
      modal.style.display = "block";
    }).catch((error) => {
      console.error("Erro ao recuperar o histórico de compras:", error);
      alert("Erro ao recuperar o histórico de compras. Por favor, tente novamente mais tarde.");
    });
  } else {
    // Usuário não autenticado, exibir mensagem de erro
    alert("Você precisa estar autenticado para ver o histórico de compras. Por favor, faça login no sistema.");
  }
});


function formatDate(date) {
  // Verifica se a data é válida
  if (!date || typeof date !== 'object' || !(date instanceof Date)) {
    return "Data não disponível";
  }

  // Formata a data no formato desejado
  const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false };
  return date.toLocaleDateString('pt-BR', options);
}





// Fechar o modal ao clicar no botão de fechar
document.querySelector("#historicModal .close12").addEventListener("click", function () {
  const modal = document.getElementById("historicModal");
  modal.style.display = "none";
});





// Função para lidar com o clique no ícone de telefone
function handlePhoneClick(phoneNumber) {
  const confirmation = confirm("Você deseja ligar para " + phoneNumber + "?");
  if (confirmation) {
    window.location.href = "tel:" + phoneNumber;
  }
}

// Adicionar eventos de clique para os ícones de telefone
document.getElementById("phoneIcon1").addEventListener("click", function () {
  handlePhoneClick("(92) 99114-9103");
});

document.getElementById("phoneIcon2").addEventListener("click", function () {
  handlePhoneClick("(92) 99446-6479");
});




function verificarHorario() {
  const agora = new Date();
  const diaSemana = agora.getDay(); // 0 = domingo, 1 = segunda, etc.
  const horaAtual = agora.getHours();
  const minutoAtual = agora.getMinutes();

  let aberto = false;

  // Horários de funcionamento
  if (diaSemana >= 1 && diaSemana <= 5) { // Segunda a sexta
    if (
      (horaAtual === 8 && minutoAtual >= 0) ||
      (horaAtual > 8 && horaAtual < 12) ||
      (horaAtual === 12 && minutoAtual <= 30) ||
      (horaAtual === 15 && minutoAtual >= 0) ||
      (horaAtual > 15 && horaAtual < 20)
    ) {
      aberto = true;
    }
  } else if (diaSemana === 6) { // Sábado
    if (
      (horaAtual === 8 && minutoAtual >= 0) ||
      (horaAtual > 8 && horaAtual < 13) ||
      (horaAtual === 13 && minutoAtual <= 0) ||
      (horaAtual === 15 && minutoAtual >= 0) ||
      (horaAtual > 15 && horaAtual < 20)
    ) {
      aberto = true;
    }
  }

  // Atualiza o status no HTML
  const statusElemento = document.getElementById('statusHorario');
  if (aberto) {
    statusElemento.textContent = 'Aberto agora'; // Exibe 'Aberto agora'
    statusElemento.classList.add('aberto'); // Adiciona a classe 'aberto'
    statusElemento.classList.remove('fechado'); // Remove a classe 'fechado'
  } else {
    statusElemento.textContent = 'Fechado agora'; // Exibe 'Fechado agora'
    statusElemento.classList.add('fechado'); // Adiciona a classe 'fechado'
    statusElemento.classList.remove('aberto'); // Remove a classe 'aberto'
  }
}

// Verifica o horário ao carregar a página
window.onload = verificarHorario;
