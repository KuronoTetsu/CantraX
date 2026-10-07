(() => {
      const dialog = document.getElementById('briefDialog');
      const menu = document.querySelector('.menu-button');
      const navLinks = document.getElementById('navLinks');
      const toast = document.getElementById('toast');
      const form = document.getElementById('briefForm');
      const recommendation = document.getElementById('recommendation');
      const copyButton = document.getElementById('copyBrief');
      const plans = {
        essencial: { name: 'Plano Essencial', copy: 'Uma landing page com objetivo e próxima ação definidos.' },
        conversa: { name: 'Plano Conversa', copy: 'Um chatbot para organizar o primeiro atendimento e encaminhar conversas.' },
        experiencia: { name: 'Plano Experiência', copy: 'Um site profissional para apresentar seu negócio com clareza.' },
        vitrine: { name: 'Plano Vitrine', copy: 'Uma loja online preparada para organizar produtos e vendas.' },
        naosei: { name: 'Diagnóstico inicial', copy: 'Uma conversa curta pode ajudar a escolher entre página, atendimento ou loja.' }
      };
      const paymentTerms = {
        12: { installmentDiscount: 10, cashDiscount: 25, prices: { essencial: { installment: '141,75', cash: '1.417,50' }, conversa: { installment: '261,75', cash: '2.617,50' }, experiencia: { installment: '442,50', cash: '4.425,00' }, vitrine: { installment: '667,50', cash: '6.675,00' } } },
        24: { installmentDiscount: 12, cashDiscount: 30, prices: { essencial: { installment: '138,60', cash: '2.646,00' }, conversa: { installment: '255,93', cash: '4.886,00' }, experiencia: { installment: '432,67', cash: '8.260,00' }, vitrine: { installment: '652,67', cash: '12.460,00' } } },
        36: { installmentDiscount: 15, cashDiscount: 35, prices: { essencial: { installment: '133,88', cash: '3.685,50' }, conversa: { installment: '247,21', cash: '6.805,50' }, experiencia: { installment: '417,92', cash: '11.505,00' }, vitrine: { installment: '630,42', cash: '17.355,00' } } }
      };
      let selectedTerm = 12;
      let summaryText = '';
      let toastTimer;
      function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
      }
      function openDialog(selected) {
        if (selected && plans[selected]) document.getElementById('need').value = selected;
        if (!dialog.open) dialog.showModal();
        updateSuggestion(false);
      }
      document.querySelectorAll('[data-open-brief]').forEach(button => button.addEventListener('click', () => openDialog()));
      document.querySelectorAll('[data-choose-plan]').forEach(button => button.addEventListener('click', () => openDialog(button.dataset.choosePlan)));
      document.querySelectorAll('[data-plan-link]').forEach(link => link.addEventListener('click', () => sessionStorage.setItem('cantraxPlanInterest', link.dataset.planLink)));
      document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => dialog.close()));
      dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
      document.addEventListener('keydown', event => { if (event.key === 'Escape' && dialog.open) dialog.close(); });
      menu.addEventListener('click', () => {
        const expanded = menu.getAttribute('aria-expanded') === 'true';
        menu.setAttribute('aria-expanded', String(!expanded));
        menu.setAttribute('aria-label', expanded ? 'Abrir menu' : 'Fechar menu');
        navLinks.classList.toggle('open', !expanded);
      });
      navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
        navLinks.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Abrir menu');
      }));
      const need = document.getElementById('need');
      const stage = document.getElementById('stage');
      const challenge = document.getElementById('challenge');
      function updateSuggestion(show) {
        const choice = plans[need.value] || plans.naosei;
        document.getElementById('recommendationTitle').textContent = choice.name;
        document.getElementById('recommendationCopy').textContent = choice.copy;
        const term = paymentTerms[selectedTerm];
        const price = term.prices[need.value];
        document.getElementById('recommendationPrice').textContent = price
          ? `${selectedTerm}x de R$ ${price.installment} ou R$ ${price.cash} à vista · proposta final a combinar`
          : 'Escopo e investimento a combinar';
        if (show) recommendation.classList.add('visible');
      }
      function invalidateSummary() {
        summaryText = '';
        copyButton.disabled = true;
      }
      function updatePaymentDisplay() {
        const term = paymentTerms[selectedTerm];
        document.getElementById('termSummary').textContent = `${selectedTerm} meses · ${term.installmentDiscount}% de desconto parcelado ou ${term.cashDiscount}% no pagamento integral à vista. Parcelas mensais durante o prazo.`;
        document.querySelectorAll('.term-options [data-term]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.term) === selectedTerm)));
        document.querySelectorAll('[data-price-card]').forEach(card => {
          const price = term.prices[card.dataset.priceCard];
          card.querySelector('[data-installment-label]').textContent = `Plano ${selectedTerm} meses · ${term.installmentDiscount}% de desconto`;
          card.querySelector('[data-installment-amount]').textContent = `${selectedTerm}x de R$ ${price.installment}`;
          card.querySelector('[data-cash-amount]').textContent = `ou R$ ${price.cash} à vista · economize ${term.cashDiscount}%`;
        });
        if (dialog.open) updateSuggestion(true);
      }
      document.querySelectorAll('.term-options [data-term]').forEach(button => button.addEventListener('click', () => {
        selectedTerm = Number(button.dataset.term);
        invalidateSummary();
        updatePaymentDisplay();
      }));
      updatePaymentDisplay();
      need.addEventListener('change', () => { invalidateSummary(); updateSuggestion(true); });
      stage.addEventListener('change', invalidateSummary);
      challenge.addEventListener('input', invalidateSummary);
      form.addEventListener('submit', event => {
        event.preventDefault();
        updateSuggestion(true);
        const needLabel = need.options[need.selectedIndex].text;
        const stageLabel = stage.options[stage.selectedIndex].text;
        const detail = challenge.value.trim();
        const choice = plans[need.value] || plans.naosei;
        const term = paymentTerms[selectedTerm];
        const price = term.prices[need.value];
        const condition = price ? `${selectedTerm}x de R$ ${price.installment} ou R$ ${price.cash} à vista (${term.cashDiscount}% de desconto à vista)` : 'Escopo e investimento a combinar';
        summaryText = ['BRIEFING INICIAL — CANTRAX', '', 'Quero conversar sobre: ' + needLabel, 'Momento atual: ' + stageLabel, 'Ponto de partida sugerido: ' + choice.name, 'Vigência desejada: ' + selectedTerm + ' meses', 'Condição indicativa: ' + condition, detail ? 'O que quero facilitar: ' + detail : ''].filter(Boolean).join('\n');
        copyButton.disabled = false;
        copyButton.textContent = 'Copiar resumo';
        showToast('Seu resumo está pronto. Ele fica somente nesta página até você copiar.');
      });
      copyButton.addEventListener('click', async () => {
        if (!summaryText) return;
        try {
          await navigator.clipboard.writeText(summaryText);
          showToast('Resumo copiado. Você decide onde compartilhar.');
        } catch {
          const temp = document.createElement('textarea');
          temp.value = summaryText; temp.setAttribute('readonly', ''); temp.style.position = 'fixed'; temp.style.opacity = '0';
          document.body.appendChild(temp); temp.select();
          const copied = document.execCommand('copy'); temp.remove();
          showToast(copied ? 'Resumo copiado. Você decide onde compartilhar.' : 'Não foi possível copiar automaticamente neste navegador.');
        }
      });
      document.getElementById('year').textContent = new Date().getFullYear();
      const revealItems = document.querySelectorAll('.reveal');
      if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const observer = new IntersectionObserver(entries => entries.forEach(entry => {
          if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); }
        }), { threshold: .12 });
        revealItems.forEach(item => observer.observe(item));
      } else revealItems.forEach(item => item.classList.add('in-view'));
      const variants = [
        [['Oi, vocês fazem sites?', 'user'], ['Fazemos sim. Você quer apresentar um serviço ou vender produtos?', 'bot'], ['Apresentar um serviço.', 'user'], ['Uma landing page pode ser um bom começo. Quer ver o escopo?', 'handoff']],
        [['Como funciona o atendimento?', 'user'], ['Podemos organizar as dúvidas comuns e encaminhar o que precisar da equipe.', 'bot'], ['E se for algo específico?', 'user'], ['A conversa segue para uma pessoa com o contexto já organizado.', 'handoff']],
        [['Quero vender pela internet.', 'user'], ['Vamos entender seu catálogo, entregas e formas de pagamento para planejar a loja.', 'bot'], ['Ainda estou organizando tudo.', 'user'], ['Sem problema. A gente pode começar pelo que já está pronto.', 'handoff']]
      ];
      let variant = 0;
      document.getElementById('replayChat').addEventListener('click', () => {
        variant = (variant + 1) % variants.length;
        const body = document.getElementById('chatPreview');
        body.replaceChildren();
        const date = document.createElement('div'); date.className = 'chat-date'; date.textContent = 'HOJE, AGORA'; body.appendChild(date);
        variants[variant].forEach(([text, kind]) => { const bubble = document.createElement('div'); bubble.className = 'bubble' + (kind === 'user' ? ' user' : kind === 'handoff' ? ' handoff' : ''); bubble.textContent = text; body.appendChild(bubble); });
      });
      const interest = sessionStorage.getItem('cantraxPlanInterest');
      if (interest && plans[interest]) need.value = interest;
    })();