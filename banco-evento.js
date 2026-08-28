const PERGUNTAS_EVENTO = [
  {
    id: 1,
    pergunta: 'Quem era Ogue, rei de Basã?',
    opcoes: ['Um sacerdote de Siló', 'Um gigante refaim derrotado por Israel', 'Um egípcio da corte de Faraó', 'Um seguidor de Jesus na Galileia'],
    certa: 1
  },
  {
    id: 2,
    pergunta: 'Quem era Melquisedeque?',
    opcoes: ['Rei de Sodoma e capitão de Abraão', 'Rei de Salém e sacerdote do Deus Altíssimo', 'Profeta de Judá no tempo de Acabe', 'Um levita do tempo de Esdras'],
    certa: 1
  },
  {
    id: 3,
    pergunta: 'Quem matou Sísera, general de Jabim?',
    opcoes: ['Débora, com uma espada', 'Baraque, no campo de batalha', 'Jael, cravando uma estaca na têmpora dele', 'Gideão, no lagar'],
    certa: 2
  },
  {
    id: 4,
    pergunta: 'Ehude, juiz de Israel, era:',
    opcoes: ['Canhoto e matou Eglom, rei de Moabe', 'Nazireu desde o ventre, como Sansão', 'Sacerdote da linhagem de Arão', 'Governador persa em Samaria'],
    certa: 0
  },
  {
    id: 5,
    pergunta: 'Balaão foi contratado para quê?',
    opcoes: ['Abençoar Israel no deserto', 'Amaldiçoar Israel a pedido de Balaque', 'Construir o altar de Jericó', 'Traduzir a Lei para o grego'],
    certa: 1
  },
  {
    id: 6,
    pergunta: 'Quem era Urias, marido de Bate-Seba?',
    opcoes: ['Um sacerdote de Nobe', 'Um hitita do exército de Davi', 'Um profeta de Anatote', 'Um escriba da corte de Salomão'],
    certa: 1
  },
  {
    id: 7,
    pergunta: 'Mefibosete era:',
    opcoes: ['Filho de Saul que morreu no Gilboa', 'Filho de Jônatas, coxo dos pés', 'O general de Abner', 'O sacerdote que ungiu Saul'],
    certa: 1
  },
  {
    id: 8,
    pergunta: 'No hebraico, Shema não é só “ouvir”. O sentido bíblico é:',
    opcoes: ['Ouvir para repetir em voz alta', 'Ouvir com a intenção de obedecer', 'Escutar música no Templo', 'Decorar a letra da palavra'],
    certa: 1
  },
  {
    id: 9,
    pergunta: 'Chesed (חֶסֶד) aponta principalmente para:',
    opcoes: ['Julgamento sem piedade', 'Amor leal de aliança, mesmo quando o outro falha', 'Orgulho da linhagem sacerdotal', 'Temor supersticioso'],
    certa: 1
  },
  {
    id: 10,
    pergunta: 'Emunah (אֱמוּנָה) descreve melhor:',
    opcoes: ['Um sentimento passageiro de fé', 'Firmeza e confiança estável, não só emoção', 'Sorte concedida no sorteio das tribos', 'Dúvida santa diante do mistério'],
    certa: 1
  },
  {
    id: 11,
    pergunta: 'Kadosh (קָדוֹשׁ) significa:',
    opcoes: ['Comum, do uso diário', 'Santo / separado / consagrado', 'Rápido como o vento', 'Escondido no Santo dos Santos apenas'],
    certa: 1
  },
  {
    id: 12,
    pergunta: 'Berit (בְּרִית) é:',
    opcoes: ['Guerra santa', 'Aliança / pacto', 'O deserto de Parã', 'O pão da proposição'],
    certa: 1
  },
  {
    id: 13,
    pergunta: 'Ruach (רוּחַ) pode significar:',
    opcoes: ['Pedra da lei', 'Espírito / vento / fôlego', 'Sangue da aliança', 'Muro da cidade'],
    certa: 1
  },
  {
    id: 14,
    pergunta: 'No grego do Novo Testamento, anomia (ἀνομία) é:',
    opcoes: ['A lei de Moisés escrita em pedra', 'Iniquidade / vida sem lei', 'O louvor no Templo', 'O batismo de João'],
    certa: 1
  },
  {
    id: 15,
    pergunta: 'Kyrios (κύριος), no contexto das Escrituras gregas, é o título de:',
    opcoes: ['Servo ou escravo da casa', 'Senhor', 'Criança recém-nascida', 'Estrangeiro da diáspora'],
    certa: 1
  },
  {
    id: 16,
    pergunta: 'Geena (γέεννα) originalmente aponta para:',
    opcoes: ['O jardim do Éden', 'O vale de Hinom, associado a juízo', 'O monte Sinai', 'O rio Jordão'],
    certa: 1
  },
  {
    id: 17,
    pergunta: 'Ágape (ἀγάπη) no Novo Testamento descreve principalmente:',
    opcoes: ['Amor de aliança, escolha e doação, não só sentimento', 'Amizade casual entre vizinhos', 'Paixão romântica de Salomão apenas', 'Temor ritual do sacrifício'],
    certa: 0
  },
  {
    id: 18,
    pergunta: 'Quem era Tíquico?',
    opcoes: ['Um gigante filisteu', 'Companheiro de Paulo, chamado de irmão amado e servo fiel', 'O sumo sacerdote que julgou Estêvão', 'O centurião de Cafarnaum'],
    certa: 1
  },
  {
    id: 19,
    pergunta: 'Hamã, no livro de Ester, era:',
    opcoes: ['Sacerdote da linhagem de Zadoque', 'Agagita que planejou destruir os judeus', 'Profeta do exílio na Babilônia', 'Um dos doze apóstolos'],
    certa: 1
  },
  {
    id: 20,
    pergunta: 'Tehom (תְּהוֹם), no hebraico de Gênesis, refere-se a:',
    opcoes: ['O firmamento visível', 'O abismo / as profundezas das águas', 'A árvore da vida', 'O nome do primeiro altar'],
    certa: 1
  }
];

if (typeof module !== 'undefined') {
  module.exports = { PERGUNTAS_EVENTO };
}
