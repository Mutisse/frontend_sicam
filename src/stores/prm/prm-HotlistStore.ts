// src/stores/prm/prm-HotlistStore.ts
import { defineStore } from "pinia";
import { computed, reactive, ref, watch } from "vue";
import {
  hotlistService,
  type VeiculoHotlist,
  type NivelHotlist,
  type EstadoHotlist,
  type OrigemHotlist,
  type MotivoHotlist,
} from "@/services/prm/hotlist.service";
import { extrairErro } from "@/boot/axios";

export const usePrmHotlistStore = defineStore("prmHotlist", () => {
  // ----------------------------------------------------------
  // Constantes
  // ----------------------------------------------------------
  const MOTIVOS: MotivoHotlist[] = [
    "Furtado",
    "Clonagem suspeita",
    "Mandado de captura",
  ];
  const NIVEIS: NivelHotlist[] = ["Alto", "Médio", "Baixo"];
  const ORIGENS: OrigemHotlist[] = ["PRM", "INATRO", "GESTMUL", "ISSM"];
  const ESTADOS: EstadoHotlist[] = ["Ativo", "Resolvido"];

  const LOCAIS = [
    "Maputo Cidade",
    "Maputo Província",
    "Gaza",
    "Inhambane",
    "Sofala",
    "Manica",
    "Tete",
    "Zambézia",
    "Nampula",
    "Cabo Delgado",
    "Niassa",
  ];

  const POSTOS = [
    "Posto Central",
    "Posto Baixa",
    "Posto Matola",
    "Posto Machava",
    "Posto KaMpfumo",
    "Posto Namaacha",
  ];

  const AGENTES = [
    "Agente Chissano",
    "Agente Nhaca",
    "Agente Sitoe",
    "Agente Cumbe",
    "Agente Bila",
    "Agente Tembe",
  ];

  const MARCAS = [
    "Toyota",
    "Nissan",
    "Mazda",
    "Honda",
    "Volkswagen",
    "Mercedes-Benz",
    "BMW",
    "Ford",
    "Hyundai",
    "Kia",
    "Mitsubishi",
    "Isuzu",
    "Renault",
    "Peugeot",
    "Outro",
  ];

  const MODELOS: Record<string, string[]> = {
    Toyota: ["Corolla", "Hilux", "Rav4", "Yaris", "Land Cruiser", "Outro"],
    Nissan: ["Navara", "Almera", "X-Trail", "Qashqai", "Outro"],
    Mazda: ["3", "6", "CX-5", "CX-3", "MX-5", "Outro"],
    Honda: ["Civic", "Fit", "CR-V", "HR-V", "Accord", "Outro"],
    Volkswagen: ["Golf", "Polo", "Passat", "Tiguan", "Outro"],
    "Mercedes-Benz": [
      "Classe A",
      "Classe C",
      "Classe E",
      "Actros",
      "Sprinter",
      "Outro",
    ],
    BMW: ["Série 1", "Série 3", "Série 5", "X1", "X3", "Outro"],
    Ford: ["Focus", "Fiesta", "Ranger", "EcoSport", "Outro"],
    Hyundai: ["i10", "i20", "i30", "Tucson", "Outro"],
    Kia: ["Rio", "Sportage", "Picanto", "Outro"],
    Mitsubishi: ["L200", "Pajero", "Outlander", "Outro"],
    Isuzu: ["D-Max", "MU-X", "Outro"],
    Renault: ["Clio", "Megane", "Duster", "Outro"],
    Peugeot: ["208", "308", "3008", "Outro"],
    Outro: ["Outro"],
  };

  const CORES = [
    "Branco",
    "Preto",
    "Cinza",
    "Prata",
    "Vermelho",
    "Azul",
    "Verde",
    "Amarelo",
    "Castanho",
    "Bege",
    "Laranja",
    "Outro",
  ];

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  function formatarInputData(d: Date): string {
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    return `${dia}/${mes}/${d.getFullYear()}`;
  }

  function formatarHora(d: Date): string {
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  // ----------------------------------------------------------
  // Estado
  // ----------------------------------------------------------
  const aCarregar = ref(false);
  const carregado = ref(false);
  const erro = ref<string | null>(null);

  const veiculos = ref<VeiculoHotlist[]>([]);

  const kpisBackend = reactive({
    total: 0,
    furtados: 0,
    clonagem: 0,
    mandados: 0,
    altos: 0,
    ativos: 0,
  });

  // ----------------------------------------------------------
  // Acções
  // ----------------------------------------------------------
  async function carregar() {
    if (aCarregar.value) return;
    aCarregar.value = true;
    erro.value = null;
    carregado.value = false;

    try {
      const atrasoMinimo = new Promise((r) => setTimeout(r, 800));

      const d = await hotlistService.listar();
      veiculos.value = d.items;
      Object.assign(kpisBackend, d.kpis);

      await atrasoMinimo;

      carregado.value = true;
    } catch (e) {
      erro.value = extrairErro(e);
    } finally {
      aCarregar.value = false;
    }
  }

  // ----------------------------------------------------------
  // KPIs
  // ----------------------------------------------------------
  const kpis = computed(() => ({
    total: kpisBackend.total,
    furtados: kpisBackend.furtados,
    clonagem: kpisBackend.clonagem,
    mandados: kpisBackend.mandados,
    ativos: kpisBackend.ativos,
    resolvidos: kpisBackend.total - kpisBackend.ativos,
    altos: kpisBackend.altos,
  }));

  // ----------------------------------------------------------
  // Filtros
  // ----------------------------------------------------------
  const pesquisa = ref("");
  const filtroMotivo = ref("");
  const filtroNivel = ref("");
  const filtroEstado = ref("");

  const temFiltrosAtivos = computed(
    () =>
      !!(
        pesquisa.value ||
        filtroMotivo.value ||
        filtroNivel.value ||
        filtroEstado.value
      ),
  );

  function limparFiltros() {
    pesquisa.value = "";
    filtroMotivo.value = "";
    filtroNivel.value = "";
    filtroEstado.value = "";
    pagina.value = 1;
  }

  // ----------------------------------------------------------
  // Ordenação
  // ----------------------------------------------------------
  const ordenacao = ref<{ key: keyof VeiculoHotlist; dir: "asc" | "desc" }>({
    key: "dataInsercao",
    dir: "desc",
  });

  function ordenarPor(key: keyof VeiculoHotlist) {
    if (ordenacao.value.key === key) {
      ordenacao.value.dir = ordenacao.value.dir === "asc" ? "desc" : "asc";
    } else {
      ordenacao.value = { key, dir: "asc" };
    }
  }

  const iconeOrdenacao = computed(() =>
    ordenacao.value.dir === "asc" ? "arrow_upward" : "arrow_downward",
  );

  // ----------------------------------------------------------
  // Filtrados + ordenados
  // ----------------------------------------------------------
  const filtrados = computed(() => {
    let lista = veiculos.value.filter((v) => {
      if (pesquisa.value) {
        const q = pesquisa.value.toLowerCase();
        if (
          !v.matricula.toLowerCase().includes(q) &&
          !v.motivo.toLowerCase().includes(q) &&
          !v.marca.toLowerCase().includes(q) &&
          !v.modelo.toLowerCase().includes(q)
        )
          return false;
      }
      if (filtroMotivo.value && v.motivo !== filtroMotivo.value) return false;
      if (filtroNivel.value && v.nivel !== filtroNivel.value) return false;
      if (filtroEstado.value && v.estado !== filtroEstado.value) return false;
      return true;
    });

    const { key, dir } = ordenacao.value;
    const mult = dir === "asc" ? 1 : -1;
    const nivelPeso: Record<NivelHotlist, number> = {
      Alto: 3,
      Médio: 2,
      Baixo: 1,
    };

    lista = [...lista].sort((a, b) => {
      let cmp = 0;
      if (key === "nivel") cmp = nivelPeso[a.nivel] - nivelPeso[b.nivel];
      else if (key === "abordagens") cmp = a.abordagens - b.abordagens;
      else if (key === "dataInsercao") {
        const [d1, m1, a1] = a.dataInsercao.split("/").map(Number);
        const [d2, m2, a2] = b.dataInsercao.split("/").map(Number);
        cmp =
          new Date(a1!, m1! - 1, d1!).getTime() -
          new Date(a2!, m2! - 1, d2!).getTime();
      } else {
        cmp = String(a[key] ?? "").localeCompare(String(b[key] ?? ""));
      }
      return cmp * mult;
    });

    return lista;
  });

  // ----------------------------------------------------------
  // Paginação
  // ----------------------------------------------------------
  const pagina = ref(1);
  const porPagina = ref(6);

  const totalPaginas = computed(() =>
    Math.max(1, Math.ceil(filtrados.value.length / porPagina.value)),
  );
  const inicioPagina = computed(() => (pagina.value - 1) * porPagina.value);
  const fimPagina = computed(() =>
    Math.min(inicioPagina.value + porPagina.value, filtrados.value.length),
  );
  const paginados = computed(() =>
    filtrados.value.slice(inicioPagina.value, fimPagina.value),
  );

  watch(filtrados, () => {
    if (pagina.value > totalPaginas.value) pagina.value = 1;
  });

  // ----------------------------------------------------------
  // Seleção
  // ----------------------------------------------------------
  const selecionados = ref<string[]>([]);

  const todosSelecionados = computed(
    () =>
      paginados.value.length > 0 &&
      paginados.value.every((v) => selecionados.value.includes(v.id)),
  );

  function toggleSelecionado(id: string) {
    const i = selecionados.value.indexOf(id);
    if (i >= 0) selecionados.value.splice(i, 1);
    else selecionados.value.push(id);
  }

  function toggleTodos() {
    if (todosSelecionados.value) selecionados.value = [];
    else selecionados.value = paginados.value.map((v) => v.id);
  }

  function limparSelecao() {
    selecionados.value = [];
  }

  // ----------------------------------------------------------
  // Modal Detalhes
  // ----------------------------------------------------------
  const modalDetalhes = ref(false);
  const veiculoDetalhe = ref<VeiculoHotlist | null>(null);

  function abrirDetalhes(v: VeiculoHotlist) {
    veiculoDetalhe.value = v;
    modalDetalhes.value = true;
  }

  // ----------------------------------------------------------
  // Modal Adicionar / Editar
  // ----------------------------------------------------------
  const modalForm = ref(false);
  const passo = ref<1 | 2 | 3>(1);
  const modoEdicao = ref(false);
  const aSalvar = ref(false);

  const form = reactive({
    id: "",
    matricula: "",
    marca: "",
    modelo: "",
    cor: "",
    origem: "PRM" as OrigemHotlist,
    dataInsercao: "",
    horaInsercao: "",
    local: "Maputo Cidade",
    posto: "Posto Central",
    agente: "Agente Chissano",
    motivo: "" as MotivoHotlist | "",
    nivel: "Alto" as NivelHotlist,
    observacoes: "",
  });

  const erros = computed<Record<string, string>>(() => {
    const e: Record<string, string> = {};
    if (form.matricula.trim().length === 0)
      e.matricula = "Matrícula é obrigatória";
    else if (form.matricula.trim().length < 6)
      e.matricula = "Deve ter pelo menos 6 caracteres";
    if (form.marca.trim().length === 0) e.marca = "Marca é obrigatória";
    if (form.modelo.trim().length === 0) e.modelo = "Modelo é obrigatório";
    if (form.cor.trim().length === 0) e.cor = "Cor é obrigatória";
    if (form.origem.length === 0) e.origem = "Origem é obrigatória";
    if (form.dataInsercao.trim().length === 0)
      e.dataInsercao = "Data é obrigatória";
    else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(form.dataInsercao.trim()))
      e.dataInsercao = "Formato inválido (dd/mm/aaaa)";
    if (form.horaInsercao.trim().length === 0)
      e.horaInsercao = "Hora é obrigatória";
    else if (!/^\d{2}:\d{2}$/.test(form.horaInsercao.trim()))
      e.horaInsercao = "Formato inválido (HH:MM)";
    if (form.local.length === 0) e.local = "Local é obrigatório";
    if (form.agente.length === 0) e.agente = "Agente é obrigatório";
    if (form.motivo === "") e.motivo = "Motivo é obrigatório";
    if (form.nivel.length === 0) e.nivel = "Nível é obrigatório";
    return e;
  });

  const passo1Valido = computed(
    () =>
      !erros.value.matricula &&
      !erros.value.marca &&
      !erros.value.modelo &&
      !erros.value.cor,
  );
  const passo2Valido = computed(
    () =>
      !erros.value.origem &&
      !erros.value.dataInsercao &&
      !erros.value.horaInsercao &&
      !erros.value.local &&
      !erros.value.agente,
  );
  const passo3Valido = computed(
    () => !erros.value.motivo && !erros.value.nivel,
  );
  const formValido = computed(
    () => passo1Valido.value && passo2Valido.value && passo3Valido.value,
  );

  function abrirAdicionar() {
    const agora = new Date();
    modoEdicao.value = false;
    passo.value = 1;
    aSalvar.value = false;
    Object.assign(form, {
      id: "",
      matricula: "",
      marca: "",
      modelo: "",
      cor: "",
      origem: "PRM" as OrigemHotlist,
      dataInsercao: formatarInputData(agora),
      horaInsercao: formatarHora(agora),
      local: "Maputo Cidade",
      posto: "Posto Central",
      agente: "Agente Chissano",
      motivo: "",
      nivel: "Alto" as NivelHotlist,
      observacoes: "",
    });
    modalForm.value = true;
  }

  function abrirEditar(v: VeiculoHotlist) {
    modoEdicao.value = true;
    passo.value = 1;
    aSalvar.value = false;
    Object.assign(form, {
      id: v.id,
      matricula: v.matricula,
      marca: v.marca,
      modelo: v.modelo,
      cor: v.cor,
      origem: v.origem,
      dataInsercao: v.dataInsercao,
      horaInsercao: v.horaInsercao,
      local: v.local,
      posto: v.posto,
      agente: v.agente,
      motivo: v.motivo,
      nivel: v.nivel,
      observacoes: v.observacoes ?? "",
    });
    modalForm.value = true;
  }

  function fecharForm() {
    modalForm.value = false;
    passo.value = 1;
  }

  function proximoPasso() {
    if (passo.value < 3) passo.value = (passo.value + 1) as 1 | 2 | 3;
  }

  function passoAnterior() {
    if (passo.value > 1) passo.value = (passo.value - 1) as 1 | 2 | 3;
  }

  async function salvarForm(): Promise<boolean> {
    if (!formValido.value || aSalvar.value) return false;
    if (form.motivo === "") return false;

    aSalvar.value = true;
    erro.value = null;

    try {
      const perigoMap: Record<NivelHotlist, "alto" | "medio" | "baixo"> = {
        Alto: "alto",
        Médio: "medio",
        Baixo: "baixo",
      };

      if (modoEdicao.value) {
        await hotlistService.actualizar(form.id, {
          motivo: form.motivo,
          perigo: perigoMap[form.nivel],
          descricao: form.observacoes || null,
        });
      } else {
        await hotlistService.criar({
          matricula: form.matricula.toUpperCase(),
          motivo: form.motivo,
          perigo: perigoMap[form.nivel],
          descricao: form.observacoes || null,
        });
      }

      await carregar();
      return true;
    } catch (e) {
      erro.value = extrairErro(e);
      return false;
    } finally {
      aSalvar.value = false;
    }
  }

  // ----------------------------------------------------------
  // Ações
  // ----------------------------------------------------------
  async function remover(id: string) {
    try {
      await hotlistService.remover(id);
      veiculos.value = veiculos.value.filter((v) => v.id !== id);
      selecionados.value = selecionados.value.filter((m) => m !== id);
    } catch (e) {
      erro.value = extrairErro(e);
    }
  }

  async function removerSelecionados() {
    if (!selecionados.value.length) return;
    try {
      await Promise.all(
        selecionados.value.map((id) => hotlistService.remover(id)),
      );
      veiculos.value = veiculos.value.filter(
        (v) => !selecionados.value.includes(v.id),
      );
      selecionados.value = [];
    } catch (e) {
      erro.value = extrairErro(e);
    }
  }

  async function marcarResolvido(id: string): Promise<boolean> {
    try {
      await hotlistService.resolver(id);
      const v = veiculos.value.find((x) => x.id === id);
      if (v) v.estado = "Resolvido";
      return true;
    } catch (e) {
      erro.value = extrairErro(e);
      return false;
    }
  }

  function reagirAbordagem(id: string): boolean {
    const v = veiculos.value.find((x) => x.id === id);
    if (!v) return false;
    v.abordagens++;
    return true;
  }

  // ----------------------------------------------------------
  // Helpers de UI
  // ----------------------------------------------------------
  function nivelClasse(nivel: NivelHotlist): "alto" | "medio" | "baixo" {
    if (nivel === "Alto") return "alto";
    if (nivel === "Médio") return "medio";
    return "baixo";
  }

  function motivoIcone(m: MotivoHotlist): string {
    if (m === "Furtado") return "report";
    if (m === "Clonagem suspeita") return "content_copy";
    return "gavel";
  }

  // ----------------------------------------------------------
  // Devolver
  // ----------------------------------------------------------
  return {
    MOTIVOS,
    NIVEIS,
    ORIGENS,
    ESTADOS,
    LOCAIS,
    POSTOS,
    AGENTES,
    MARCAS,
    MODELOS,
    CORES,

    aCarregar,
    carregado,
    erro,
    veiculos,
    kpis,
    carregar,

    pesquisa,
    filtroMotivo,
    filtroNivel,
    filtroEstado,
    temFiltrosAtivos,
    filtrados,
    limparFiltros,

    ordenacao,
    ordenarPor,
    iconeOrdenacao,

    pagina,
    porPagina,
    totalPaginas,
    inicioPagina,
    fimPagina,
    paginados,

    selecionados,
    todosSelecionados,
    toggleSelecionado,
    toggleTodos,
    limparSelecao,

    modalDetalhes,
    veiculoDetalhe,
    abrirDetalhes,

    modalForm,
    passo,
    modoEdicao,
    aSalvar,
    form,
    formValido,
    passo1Valido,
    passo2Valido,
    passo3Valido,
    erros,
    abrirAdicionar,
    abrirEditar,
    fecharForm,
    proximoPasso,
    passoAnterior,
    salvarForm,

    remover,
    removerSelecionados,
    marcarResolvido,
    reagirAbordagem,

    nivelClasse,
    motivoIcone,
  };
});
