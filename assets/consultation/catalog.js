// Read-only reference view: deliberately independent of training state and localStorage.
(() => {
  const $ = selector => document.querySelector(selector);
  let catalog;
  let filter = 'all';
  let photoTrigger;
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  function photoButton(source, label, figure) {
    const button = element('button', 'button', label);
    button.type = 'button';
    button.addEventListener('click', () => { photoTrigger = button; openPhoto(source, figure); });
    return button;
  }
  function openPhoto(source, figure) {
    $('#photo-title').textContent = `${source.label} · figura ${figure || source.figure}`;
    const image = $('#photo-image');
    image.hidden = false;
    $('#photo-error').hidden = true;
    image.alt = `Foto original de consulta, ${source.label.toLowerCase()}, figuras ${source.figure}`;
    image.src = source.file;
    $('#photo-original').href = source.file;
    $('#photo-viewer').showModal();
  }
  function renderSources() {
    $('#source-photos').replaceChildren(...catalog.sources.map(source => {
      const button = photoButton(source, '', source.figure);
      button.className = 'source';
      const image = element('img');
      image.src = source.file;
      image.alt = '';
      image.width = 44;
      image.height = 60;
      const copy = element('span');
      copy.append(element('strong', '', source.label), element('small', '', `Fig. ${source.figure} · ver foto`));
      button.append(image, copy);
      return button;
    }));
  }
  function render() {
    if (!catalog) return;
    const query = normalize($('#catalog-search').value.trim());
    const matches = catalog.exercises.filter(exercise => {
      const inFilter = filter === 'all' || (filter === 'advanced' ? exercise.advanced : exercise.source === filter);
      return inFilter && normalize(`${exercise.name} ${exercise.description} ${exercise.figure}`).includes(query);
    });
    $('.filters').querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
    $('#catalog-count').textContent = `${matches.length} de ${catalog.exercises.length} referencias · sin pauta asignada`;
    $('#catalog-empty').hidden = matches.length > 0;
    $('#catalog-list').replaceChildren(...matches.map(exercise => {
      const source = catalog.sources.find(item => item.id === exercise.source);
      const card = element('li', 'card');
      const index = catalog.exercises.indexOf(exercise) + 1;
      card.value = index;
      card.dataset.referenceId = exercise.id;
      const number = element('span', 'number', String(index).padStart(2, '0'));
      number.setAttribute('aria-hidden', 'true');
      const content = element('div');
      content.append(element('div', 'meta', `${source.label} · figura ${exercise.figure}`), element('h2', '', exercise.name));
      if (exercise.tag) content.append(element('span', 'tag', exercise.tag));
      content.append(element('p', 'description', exercise.description));
      const actions = element('div', 'actions');
      const photo = photoButton(source, 'Ver foto de consulta', exercise.figure);
      photo.setAttribute('aria-label', `Ver figura ${exercise.figure}: ${exercise.name}`);
      actions.append(photo);
      if (exercise.demo) {
        const demo = element('a', 'button', `${exercise.demo.label} ↗`);
        demo.href = exercise.demo.url;
        demo.target = '_blank';
        demo.rel = 'noopener noreferrer';
        actions.append(demo);
      }
      content.append(actions);
      content.append(element('p', 'media-note', exercise.demo ? `${exercise.demo.match} Sin GIF verificado para esta variante.` : 'Demostración de esta variante: foto original. Sin vídeo o GIF equivalente verificado.'));
      if (exercise.demo?.index) {
        const fallback = element('a', '', 'Si el vídeo no abre: consultar el índice de Cornell Health ↗');
        fallback.href = exercise.demo.index;
        fallback.target = '_blank';
        fallback.rel = 'noopener noreferrer';
        const note = element('p', 'media-note');
        note.append(fallback);
        content.append(note);
      }
      if (exercise.relation) content.append(element('p', 'related', `Variante relacionada · ${exercise.relation}`));
      card.append(number, content);
      return card;
    }));
  }
  async function loadCatalog() {
    $('#catalog-error').hidden = true;
    $('#catalog-count').textContent = 'Cargando referencias…';
    try {
      const response = await fetch('./assets/consultation/catalog.json');
      if (!response.ok) throw new Error('Catalog unavailable');
      const data = await response.json();
      if (!Array.isArray(data.exercises) || !Array.isArray(data.sources)) throw new Error('Invalid catalog');
      catalog = data;
      renderSources();
      render();
    } catch (_) {
      $('#catalog-count').textContent = 'Referencias no disponibles';
      $('#catalog-error').hidden = false;
      $('#catalog-empty').hidden = true;
    }
  }
  $('.filters').addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    filter = button.dataset.filter;
    render();
  });
  $('#catalog-search').addEventListener('input', render);
  $('#clear-filters').addEventListener('click', () => {
    filter = 'all';
    $('#catalog-search').value = '';
    render();
    $('#catalog-search').focus();
  });
  $('#retry-catalog').addEventListener('click', loadCatalog);
  $('#photo-close').addEventListener('click', () => $('#photo-viewer').close());
  $('#photo-viewer').addEventListener('close', () => {
    $('#photo-image').removeAttribute('src');
    photoTrigger?.focus({preventScroll:true});
  });
  $('#photo-image').addEventListener('error', () => {
    $('#photo-image').hidden = true;
    $('#photo-error').hidden = false;
  });
  loadCatalog();
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
  }
})();
