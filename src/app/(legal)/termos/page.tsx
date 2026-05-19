import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso — OdontIAChat",
  description:
    "Termos e condições de uso da plataforma OdontIAChat para clínicas odontológicas.",
};

export default function TermosPage() {
  const lastUpdate = "13 de maio de 2026";

  return (
    <article>
      <h1 className="text-3xl md:text-4xl font-display font-extrabold text-text-primary mb-2">
        Termos de Uso
      </h1>
      <p className="text-sm text-text-muted mb-8">
        Última atualização: {lastUpdate}
      </p>

      <Section title="1. Aceitação">
        <p>
          Ao criar uma conta ou usar a OdontIAChat (“Plataforma”), você concorda com
          estes Termos e com nossa{" "}
          <a href="/privacidade" className="text-brand-primary hover:underline">
            Política de Privacidade
          </a>
          . Se você não concorda, não use a Plataforma.
        </p>
      </Section>

      <Section title="2. O serviço">
        <p>
          A OdontIAChat oferece atendimento automatizado de pacientes via WhatsApp,
          agendamento integrado com Google Calendar, gestão de pacientes e
          conversas, e ferramentas de configuração de IA para clínicas odontológicas.
        </p>
        <p>
          A Plataforma é fornecida “como está”. Não garantimos disponibilidade
          ininterrupta, mas trabalhamos para manter uptime alto e comunicaremos
          janelas de manutenção programada.
        </p>
      </Section>

      <Section title="3. Conta e responsabilidades">
        <ul>
          <li>
            Você é responsável pela veracidade das informações cadastradas e pela
            guarda das credenciais de acesso;
          </li>
          <li>
            Cada clínica é responsável pelas mensagens e agendamentos gerados pela
            IA, devendo revisar a configuração antes de ativar o atendimento;
          </li>
          <li>
            É proibido usar a Plataforma para spam, fraude, conteúdo ilegal, abuso
            ou qualquer atividade que viole termos do WhatsApp, do Google ou da
            legislação brasileira;
          </li>
          <li>
            Você é o controlador dos dados dos seus pacientes. A OdontIAChat atua
            como operadora.
          </li>
        </ul>
      </Section>

      <Section title="4. Integrações de terceiros">
        <p>
          A Plataforma se integra ao WhatsApp (via Twilio), Google Calendar e OpenAI.
          O uso dessas integrações está sujeito aos termos de cada serviço. Você é
          responsável por manter contas válidas e respeitar as políticas dos
          fornecedores.
        </p>
      </Section>

      <Section title="5. Planos, pagamentos e cancelamento">
        <p>
          Os planos e valores estão descritos na Plataforma. A cobrança é mensal ou
          anual conforme escolhido. Pagamentos atrasados podem resultar em suspensão
          do serviço após aviso prévio. Você pode cancelar a qualquer momento; o
          serviço permanece ativo até o fim do ciclo já pago, sem reembolso
          proporcional, salvo previsão legal em contrário.
        </p>
      </Section>

      <Section title="6. Propriedade intelectual">
        <p>
          Marca, código, design e materiais da OdontIAChat são de propriedade da
          empresa. Você mantém todos os direitos sobre dados, configurações e
          conteúdos que produzir ou inserir na Plataforma.
        </p>
      </Section>

      <Section title="7. Limitação de responsabilidade">
        <p>
          Na máxima extensão permitida em lei, a OdontIAChat não responde por danos
          indiretos, lucros cessantes, perda de oportunidade ou consequências de
          decisões clínicas baseadas nas respostas da IA. A IA é uma ferramenta de
          triagem e atendimento administrativo, não substituindo avaliação
          profissional do cirurgião-dentista.
        </p>
      </Section>

      <Section title="8. Suspensão e encerramento">
        <p>
          Podemos suspender ou encerrar contas em caso de violação destes Termos,
          uso indevido ou inadimplência prolongada. Em caso de encerramento,
          fornecemos exportação dos dados em formato estruturado durante 30 dias.
        </p>
      </Section>

      <Section title="9. Alterações">
        <p>
          Podemos atualizar estes Termos. Alterações materiais serão comunicadas
          pelo portal ou por e-mail com pelo menos 15 dias de antecedência.
        </p>
      </Section>

      <Section title="10. Foro e legislação aplicável">
        <p>
          Estes Termos são regidos pela legislação brasileira. Fica eleito o foro da
          comarca da sede da OdontIAChat para dirimir quaisquer controvérsias, com
          renúncia a qualquer outro, por mais privilegiado que seja.
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
