// Busca da página inicial: leva o termo pra tela de cursos
// (menudashbord.html?busca=...)
document.getElementById('searchForm').addEventListener('submit', function (e) {
  e.preventDefault();
  var termo = document.getElementById('q').value.trim();
  window.location.href = 'menudashbord.html' + (termo ? '?busca=' + encodeURIComponent(termo) : '');
});