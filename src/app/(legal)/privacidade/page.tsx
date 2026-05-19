import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade — OdontIAChat",
  description:
    "Como a OdontIAChat coleta, usa e protege seus dados e os dados dos seus pacientes.",
};

export default function PrivacidadePage() {
  const lastUpdate = "13 de maio de 2026";

  return (
    <article className="prose-content">
      <h1 className="text-3xl md:text-4xl font-display font-extrabold text-text-primary mb-2">
        Política de Privacidade
      </h1>
      <p className="text-sm text-text-muted mb-8">
        Última atualização: {lastUpdate}
      </p>

      <Section title="1. Quem somos">
        <p>
          A OdontIAChat é uma plataforma de atendimento automatizado por WhatsApp para
          clínicas odontológicas. Esta Política descreve como coletamos, usamos,
          compartilhamos e protegemos informações dos titulares dos dados (clínicas
          contratantes e seus pacientes finais), em conformidade com a Lei Geral de
          Proteção de Dados (LGPD — Lei nº 13.709/2018).
        </p>
      </Section>

      <Section title="2. Dados que coletamos">
        <p>
          <strong>Dados da clínica:</strong> nome, CNPJ, e-mail, telefone, endereço,
          dados dos profissionais cadastrados, configurações da IA, preferências de
          atendimento e dados de faturamento.
        </p>
        <p>
          <strong>Dados dos pacientes:</strong> nome, telefone, conteúdo das mensagens
          de WhatsApp trocadas com a clínica, histórico de agendamentos e
          procedimentos solicitados. Esses dados são tratados pela OdontIAChat como
          operadora, sob instruções da clínica (controladora).
        </p>
        <p>
          <strong>Dados técnicos:</strong> endereço IP, identificadores de dispositivo,
          logs de acesso, cookies essenciais para autenticação.
        </p>
      </Section>

      <Section title="3. Como usamos os dados do Google">
        <p>
          Quando a clínica conecta uma conta Google, solicitamos permissão para
          acessar o Google Calendar dela. Usamos esse acesso <strong>exclusivamente</strong>{" "}
          para:
        </p>
        <ul>
          <li>Criar eventos quando um paciente agenda consulta pelo WhatsApp;</li>
          <li>Consultar horários ocupados para evitar conflitos de agenda;</li>
          <li>Cancelar ou reagendar eventos a pedido da clínica ou do paciente.</li>
        </ul>
        <p>
          <strong>O que NÃO fazemos:</strong> não lemos eventos não relacionados a
          consultas, não compartilhamos seus eventos com terceiros, não usamos esses
          dados para treinar modelos de IA, não exibimos seus eventos em qualquer
          interface além da própria conta Google da clínica. O token de acesso fica
          armazenado de forma criptografada e a clínica pode revogá-lo a qualquer
          momento em <em>Configurações &gt; Integrações</em> ou na própria conta Google.
        </p>
      </Section>

      <Section title="4. Finalidades do tratamento">
        <ul>
          <li>Prestação dos serviços contratados pela clínica;</li>
          <li>Atendimento automatizado de pacientes via WhatsApp;</li>
          <li>Agendamento e gestão de consultas;</li>
          <li>Faturamento e cobrança;</li>
          <li>Suporte técnico;</li>
          <li>Cumprimento de obrigações legais e regulatórias.</li>
        </ul>
      </Section>

      <Section title="5. Compartilhamento de dados">
        <p>
          Compartilhamos dados apenas com subprocessadores estritamente necessários ao
          funcionamento do serviço:
        </p>
        <ul>
          <li>
            <strong>OpenAI</strong> — para gerar respostas da IA (mensagens são enviadas
            sem identificadores pessoais quando possível);
          </li>
          <li>
            <strong>Twilio</strong> — provedor de integração WhatsApp (apenas conteúdo e
            número, dentro da política do WhatsApp Business);
          </li>
          <li>
            <strong>Supabase</strong> — armazenamento de banco de dados e autenticação
            (data center na América do Sul);
          </li>
          <li>
            <strong>Google Calendar</strong> — apenas para clínicas que conectarem a
            integração, conforme item 3.
          </li>
        </ul>
        <p>
          Não vendemos nem alugamos dados pessoais. Compartilhamos com autoridades
          públicas apenas mediante ordem judicial ou obrigação legal.
        </p>
      </Section>

      <Section title="6. Retenção de dados">
        <p>
          Mantemos os dados enquanto a conta da clínica estiver ativa. Após o
          encerramento, os dados são excluídos em até 90 dias, exceto quando houver
          obrigação legal de retenção (ex.: registros fiscais por 5 anos).
        </p>
      </Section>

      <Section title="7. Direitos do titular">
        <p>Você pode, a qualquer momento:</p>
        <ul>
          <li>Confirmar a existência de tratamento;</li>
          <li>Acessar e corrigir seus dados;</li>
          <li>Solicitar a exclusão;</li>
          <li>Portar seus dados;</li>
          <li>Revogar consentimentos;</li>
          <li>Apresentar reclamação à ANPD.</li>
        </ul>
        <p>
          Para exercer qualquer desses direitos, envie e-mail para{" "}
          <a href="mailto:privacidade@odontiachat.com.br">
            privacidade@odontiachat.com.br
          </a>
          .
        </p>
      </Section>

      <Section title="8. Segurança">
        <p>
          Usamos criptografia em trânsito (TLS 1.2+) e em repouso, controle de acesso
          baseado em papéis, segregação multi-tenant no banco e auditoria de eventos
          sensíveis. Apesar disso, nenhum sistema é 100% imune; em caso de incidente,
          comunicaremos titulares e a ANPD nos prazos da LGPD.
        </p>
      </Section>

      <Section title="9. Encarregado pelo tratamento (DPO)">
        <p>
          Em construção. Até a indicação formal do DPO, contato pelo e-mail{" "}
          <a href="mailto:privacidade@odontiachat.com.br">
            privacidade@odontiachat.com.br
          </a>
          .
        </p>
      </Section>

      <Section title="10. Alterações">
        <p>
          Podemos atualizar esta Política. Mudanças relevantes serão comunicadas pelo
          portal ou por e-mail com pelo menos 15 dias de antecedência.
        </p>
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="font-display font-bold text-xl text-text-primary mb-3">
        {title}
      </h2>
      <div className="space-y-3 text-text-secondary leading-relaxed">{children}</div>
    </section>
  );
}
