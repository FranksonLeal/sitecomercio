// Função para cadastrar um produto no Firestore
function cadastrarNovoProduto(imageFile, nome, preco) {
    const storageRef = firebase.storage().ref();
    const imageRef = storageRef.child(imageFile.name);
    imageRef.put(imageFile).then(() => {
      imageRef.getDownloadURL().then((imageUrl) => {
        db.collection("produtos")
          .add({
            imagem: imageUrl,
            nome: nome,
            preco: parseFloat(preco),
          })
          .then((docRef) => {
            alert("Produto cadastrado com sucesso. ");
  
            productForm.reset();
  
            atualizarTabelaProdutos();
          })
          .catch((error) => {
            console.error("Erro ao cadastrar produto: ", error);
          });
      });
    });
  }
  
  function preencherFormulario(id, nome, preco, imagemUrl) {
    document.getElementById("product-form").dataset.productId = id;
    document.getElementById("product-name").value = nome;
    document.getElementById("product-price").value = preco;
  
    const imageInput = document.getElementById("product-image");
    imageInput.value = ""; // Limpar o valor atual, se houver
    imageInput.setAttribute("data-prev-image", imagemUrl); // Armazenar a imagem original
  
    if (imagemUrl) {
      const previewImage = document.createElement("img");
      previewImage.src = imagemUrl;
      previewImage.style.maxWidth = "200px";
      imageInput.parentNode.insertBefore(previewImage, imageInput.nextSibling);
    }
  
    document.getElementById("submit-button").innerText = "Salvar Alterações";
    document
      .getElementById("submit-button")
      .removeEventListener("click", submitForm);
    document
      .getElementById("submit-button")
      .addEventListener("click", salvarAlteracoes);
  }
  
  function atualizarDadosProduto(id, nome, preco, imageUrl = null) {
    const dataToUpdate = {
      nome: nome,
      preco: parseFloat(preco),
    };
  
    if (imageUrl) {
      dataToUpdate.imagem = imageUrl;
    }
  
    db.collection("produtos")
      .doc(id)
      .update(dataToUpdate)
      .then(() => {
        alert("Produto atualizado com sucesso.");
        atualizarTabelaProdutos();
        limparFormulario(); // Limpar o formulário após uma atualização bem-sucedida
      })
      .catch((error) => {
        console.error("Erro ao atualizar produto: ", error);
      });
  }
  
  // Função para atualizar a imagem de um produto existente
  function atualizarImagemProduto(imageFile, id) {
    return new Promise((resolve, reject) => {
      const storageRef = firebase.storage().ref();
      const imageRef = storageRef.child(imageFile.name);
      imageRef.put(imageFile).then(() => {
        imageRef.getDownloadURL().then((imageUrl) => {
          db.collection("produtos")
            .doc(id)
            .update({
              imagem: imageUrl,
            })
            .then(() => {
              alert("Imagem do produto atualizada com sucesso.");
              resolve(imageUrl);
            })
            .catch((error) => {
              reject(error);
            });
        });
      });
    });
  }
  
  // Função para limpar a imagem do formulário
  function limparImagemFormulario() {
    const imageInput = document.getElementById("product-image");
    imageInput.value = "";
    const previewImage = imageInput.nextElementSibling;
    if (previewImage.tagName === "IMG") {
      previewImage.remove();
    }
  }
  
  // Função para salvar as alterações do produto
  function salvarAlteracoes(event) {
    event.preventDefault();
    const id = document.getElementById("product-form").dataset.productId;
    const nome = document.getElementById("product-name").value;
    const preco = document.getElementById("product-price").value;
    const imageFile = document.getElementById("product-image").files[0];
  
    // Verificar se há uma nova imagem selecionada
    if (imageFile) {
      atualizarImagemProduto(imageFile, id)
        .then((imageUrl) => {
          atualizarDadosProduto(id, nome, preco, imageUrl);
        })
        .catch((error) => {
          console.error("Erro ao atualizar imagem do produto: ", error);
        });
    } else {
      atualizarDadosProduto(id, nome, preco);
    }
  }
  
  let produtoEmEdicao = false;
  
  // Função para editar um produto
  function editarProduto(id, nome, preco, imagemUrl) {
    if (produtoEmEdicao) {
      alert("O produto já está sendo editado.");
    } else {
      produtoEmEdicao = true;
  
      preencherFormulario(id, nome, preco, imagemUrl);
    }
  }
  
  // Função para limpar o formulário após uma atualização bem-sucedida
  function limparFormulario() {
    document.getElementById("product-form").reset(); // Limpar o formulário
    document.getElementById("product-form").removeAttribute("data-product-id");
    document.getElementById("submit-button").innerText = "Cadastrar Produto";
    document
      .getElementById("submit-button")
      .removeEventListener("click", salvarAlteracoes);
    document
      .getElementById("submit-button")
      .addEventListener("click", submitForm);
  
    // Limpa a imagem do formulário
    limparImagemFormulario();
  
    produtoEmEdicao = false;
  }
  
  // Função para enviar o formulário de cadastro
  function submitForm() {
    const imageFile = document.getElementById("product-image").files[0];
    if (imageFile) {
      const nome = document.getElementById("product-name").value;
      const preco = document.getElementById("product-price").value;
      const productId = document.getElementById("product-form").dataset.productId;
  
      if (productId) {
        atualizarImagemProduto(imageFile, productId);
      } else {
        cadastrarNovoProduto(imageFile, nome, preco);
      }
    }
  }
  
  // Função para excluir um produto
  function excluirProduto(id) {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      db.collection("produtos")
        .doc(id)
        .delete()
        .then(() => {
          alert("Produto excluído com sucesso.");
          atualizarTabelaProdutos();
        })
        .catch((error) => {
          console.error("Erro ao excluir produto: ", error);
        });
    }
  }
  
  // Função para exibir os produtos na tabela
  function atualizarTabelaProdutos() {
    const productTableBody = document.querySelector("#product-table tbody");
    productTableBody.innerHTML = "";
  
    // Consultar os produtos no Firestore e adicionar na tabela
    db.collection("produtos")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const produto = doc.data();
          const newRow = `
                  <tr>
                      <td><img src="${produto.imagem}" alt="Imagem do Produto"></td>
                      <td>${produto.nome}</td>
                      <td>${produto.preco}</td>
                      <td>
                          <button class="btn-editar" onclick="editarProduto('${doc.id}', '${produto.nome}', '${produto.preco}', '${produto.imagem}')">Editar</button>
                          <button class="btn-excluir" onclick="excluirProduto('${doc.id}')">Excluir</button>
                      </td>
                  </tr>
              `;
          productTableBody.insertAdjacentHTML("beforeend", newRow);
        });
      });
  }
  
  // Função para editar um cliente
  function editarCliente(id, nome, email, telefone, endereco) {
    const novoNome = prompt("Digite o novo nome do cliente:", nome);
    const novoEmail = prompt("Digite o novo e-mail do cliente:", email);
    const novoTelefone = prompt("Digite o novo telefone do cliente:", telefone);
    const novoEndereco = prompt("Digite o novo endereço do cliente:", endereco);
  
    if (
      novoNome !== null &&
      novoEmail !== null &&
      novoTelefone !== null &&
      novoEndereco !== null
    ) {
      db.collection("clientes")
        .doc(id)
        .update({
          nome: novoNome,
          email: novoEmail,
          telefone: novoTelefone,
          endereco: novoEndereco,
        })
        .then(() => {
          alert("Cliente atualizado com sucesso.");
          atualizarTabelaClientes();
        })
        .catch((error) => {
          console.error("Erro ao atualizar cliente: ", error);
        });
    }
  }
  
  // Função para excluir um cliente
  function excluirCliente(id) {
    if (confirm("Tem certeza que deseja excluir este cliente?")) {
      db.collection("clientes")
        .doc(id)
        .delete()
        .then(() => {
          alert("Cliente excluído com sucesso.");
          atualizarTabelaClientes();
        })
        .catch((error) => {
          console.error("Erro ao excluir cliente: ", error);
        });
    }
  }
  
  // Função para exibir os clientes na tabela
  function atualizarTabelaClientes() {
    const clientTableBody = document.querySelector("#client-table tbody");
    clientTableBody.innerHTML = "";
  
    // Consultar os clientes no Firestore e adicionar na tabela
    db.collection("clientes")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const cliente = doc.data();
          const newRow = `
                  <tr>
                      <td>${cliente.nome}</td>
                      <td>${cliente.email}</td>
                      <td>${cliente.telefone}</td>
                      <td>${cliente.endereco}</td>
                      <td>
                          <button class="btn-editar" onclick="editarCliente('${doc.id}', '${cliente.nome}', '${cliente.email}', '${cliente.telefone}', '${cliente.endereco}')">Editar</button>
                          <button class="btn-excluir" onclick="excluirCliente('${doc.id}')">Excluir</button>
                      </td>
                  </tr>
              `;
          clientTableBody.insertAdjacentHTML("beforeend", newRow);
        });
      });
  }
  
  const productForm = document.getElementById("product-form");
  productForm.addEventListener("submit", submitForm);
  
  document.addEventListener("DOMContentLoaded", () => {
    atualizarTabelaProdutos();
    atualizarTabelaClientes();
  });
  
  const facebookIcon = document.querySelector(".fab.fa-facebook-f");
  const instagramIcon = document.querySelector(".fab.fa-instagram");
  
  facebookIcon.addEventListener("click", function () {
    window.location.href = "https://www.facebook.com/sua_pagina";
  });
  
  instagramIcon.addEventListener("click", function () {
    window.location.href = "https://www.instagram.com/sua_pagina";
  });
  
  const logoImage = document.querySelector(".logo img");
  
  logoImage.addEventListener("click", function () {
    window.location.href = "index.html";
  });
  