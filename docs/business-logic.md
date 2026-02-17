# API GymTrack: Lógica de Negócio e Arquitetura

Este documento fornece uma visão geral de alto nível da lógica de negócio e da estrutura da API da aplicação GymTrack. Seu propósito é ajudar desenvolvedores a entender as funcionalidades principais e como as diferentes partes do sistema interagem.

## Módulos Principais

A aplicação é construída em torno de uma arquitetura modular, com dois módulos de domínio primários responsáveis pela lógica de negócio principal: o `Módulo de Identidade` e o `Módulo de Plano de Treino`. Eles são apoiados por uma coleção de módulos compartilhados que fornecem infraestrutura comum, como autenticação, configuração e logging.

## Módulo de Identidade

O Módulo de Identidade lida com todos os aspectos de identidade de usuário e gerenciamento de acesso. É a base para saber quem está usando a aplicação e o que eles têm permissão para fazer.

### Autenticação de Usuário

Este é o ponto de entrada para os usuários. O módulo fornece fluxos de autenticação padrão.

-   **Login:** Usuários se autenticam com email e senha para receber um JSON Web Token (JWT) para acessar endpoints protegidos.
-   **Redefinição de Senha:** Usuários podem solicitar uma redefinição de senha por email. Um código único é gerado e enviado a eles, que pode ser usado para definir uma nova senha.

### Gerenciamento de Usuários

Além da autenticação, o módulo gerencia os dados do perfil do usuário e as conexões sociais.

-   **Perfis de Usuário:** Informações centrais do usuário são armazenadas e gerenciadas aqui.
-   **Sistema de Seguir:** Usuários podem seguir uns aos outros, criando um grafo social dentro da aplicação. Isso é gerenciado através da entidade `UserFollows`.

### Entidades Principais

-   `User`: Representa um usuário da aplicação com credenciais e informações de perfil.
-   `UserFollows`: Uma tabela de ligação que representa uma relação de "seguir" entre dois usuários.
-   `UserPrivacySettings`: Gerencia configurações relacionadas à privacidade para a conta de um usuário.

## Módulo de Plano de Treino

Este é o módulo funcional principal da aplicação GymTrack. Ele gerencia tudo relacionado à criação, compartilhamento e execução de planos de treino.

### Conceitos Essenciais

Um plano de treino é uma coleção estruturada de treinos projetada para ser seguida ao longo de um período de tempo.

-   **Plano de Treino:** O contêiner de nível superior. Possui nome, descrição, nível de dificuldade, visibilidade (público ou privado) e um autor.
-   **Dia:** Um plano de treino é composto por múltiplas entidades `Day`, representando o treino de um dia específico.
-   **Exercício:** Cada `Day` é composto por múltiplas entidades `Exercise`, que são as atividades individuais a serem realizadas.

### Gerenciamento de Planos

A API fornece um conjunto completo de operações CRUD (Criar, Ler, Atualizar, Deletar) para gerenciar os planos de treino.

-   **Criação e Exclusão:** Usuários podem criar novos planos do zero e deletar os planos que possuem.
-   **Listagem e Descoberta:** A API permite listar todos os planos públicos, bem como os planos de um autor específico.
-   **Clonagem:** Usuários podem clonar um plano de treino existente para seu próprio perfil para modificá-lo ou segui-lo.

### Recursos Sociais

Para incentivar o engajamento da comunidade, os usuários podem interagir com os planos de treino.

-   **Curtidas:** Usuários podem "curtir" um plano de treino.
-   **Comentários:** Usuários podem deixar comentários em um plano de treino.
-   **Feedback e Avaliações:** Um sistema de feedback dedicado permite que os usuários forneçam uma classificação por estrelas e uma mensagem de texto sobre um plano.

### Inscrições e Acesso

Este conjunto de funcionalidades gerencia como os usuários se engajam com os planos.

-   **Inscrição no Plano:** Usuários podem se inscrever em um plano de treino para segui-lo. O sistema rastreia seu status (ex: ativo, concluído).
-   **Controle de Acesso:** O módulo respeita a visibilidade de um plano (ex: um usuário não pode se inscrever em um plano privado ao qual não tem acesso).

### Entidades Principais

-   `TrainingPlan`: A entidade principal que representa um plano de treino.
-   `Day`: Um dia específico dentro de um plano.
-   `Exercise`: Um exercício específico dentro de um dia.
-   `PlanSubscription`: Vincula um `User` a um `TrainingPlan` que ele está seguindo.
-   `TrainingPlanLike`: Representa a "curtida" de um usuário em um plano.
-   `TrainingPlanComment`: Um comentário deixado por um usuário em um plano.
-   `TrainingPlanFeedback`: Uma avaliação e/ou mensagem de um usuário sobre um plano.

## Infraestrutura Compartilhada

Vários módulos compartilhados fornecem funcionalidades comuns e transversais para toda a aplicação:

-   `AuthModule`: Fornece a estratégia JWT e os guards usados para proteger endpoints.
-   `ConfigModule`: Gerencia variáveis de ambiente e a configuração da aplicação.
-   `LoggerModule`: Fornece logging estruturado para toda a aplicação.
-   `EmailModule`: Lida com o envio de emails, como para redefinição de senha.
-   `StorageModule`: Fornece uma abstração para interagir com armazenamento de arquivos (ex: para imagens de usuário ou de planos).

## Próximos Passos

Para ver como essa lógica de negócio é exposta para o mundo exterior, você pode explorar os arquivos de `Controller` dentro do diretório `http/rest/controller` de cada módulo.

-   `identity/http/rest/controller/`: Controllers para autenticação e gerenciamento de usuários.
-   `training-plan/http/rest/controller/`: Controllers para gerenciar planos de treino, dias, exercícios e inscrições.
