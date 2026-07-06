// ============================================================
// Контент шпаргалки. Просто добавляй новые объекты в массивы —
// сайт подхватит их автоматически, ничего больше трогать не надо.
// Структура ответа: what (что это) -> key (ключевое отличие) -> example (пример/следствие)
// ============================================================

const CATEGORIES = [
  { id: "kotlin",      label: "Kotlin.kt",       icon: "K" },
  { id: "java",        label: "Java.java",       icon: "J" },
  { id: "android",     label: "AndroidSDK.kt",   icon: "A" },
  { id: "viewxml",     label: "ViewXML.kt",      icon: "Vx" },
  { id: "compose",     label: "Compose.kt",      icon: "Cp" },
  { id: "coroutines",  label: "Coroutines.kt",   icon: "Co" },
  { id: "flow",        label: "Flow.kt",         icon: "Fl" },
  { id: "concurrency", label: "Concurrency.kt",  icon: "Cc" },
  { id: "di",          label: "Dagger.kt",       icon: "D" },
  { id: "hilt",        label: "Hilt.kt",         icon: "H" },
  { id: "patterns",    label: "Patterns.kt",     icon: "P" },
  { id: "arch",        label: "ArchPatterns.kt", icon: "Ar" },
  { id: "cleancode",   label: "CleanCode.kt",    icon: "Cl" },
  { id: "algo",        label: "Algorithms.kt",   icon: "Al" },
  { id: "room",        label: "Room.kt",         icon: "Rm" },
  { id: "retrofit",    label: "Retrofit.kt",     icon: "Rt" },
  { id: "git",         label: "Git.sh",          icon: "G" },
  { id: "testing",     label: "Testing.kt",      icon: "T" },
  { id: "sysdesign",   label: "SystemDesign.md", icon: "Sd" },
  { id: "rxjava",      label: "RxJava.kt",       icon: "Rx" },
  { id: "lifehacks",   label: "Lifehacks.md",    icon: "L" },
  { id: "resume",      label: "Resume.md",       icon: "R" },
];

const QUESTIONS = [
  // ---------------- KOTLIN ----------------
  {
    id: "k1", cat: "kotlin", q: "Чем map отличается от mapTo?",
    what: "Обе функции трансформируют элементы коллекции, применяя переданную лямбду к каждому элементу.",
    key: "map создаёт новый список и возвращает его. mapTo принимает уже существующую коллекцию-приёмник (destination) и складывает результат туда же, возвращая эту же коллекцию.",
    example: "list.mapTo(mutableSetOf()) { it * 2 } — полезно, когда нужно сразу получить не List, а Set/другую коллекцию, без промежуточной аллокации.",
    code: `val src = listOf(1, 2, 3)

// map — создаёт новый List
val doubled: List<Int> = src.map { it * 2 }

// mapTo — пишет в переданную коллекцию
val doubledSet: MutableSet<Int> = src.mapTo(mutableSetOf()) { it * 2 }`
  },
  {
    id: "k2", cat: "kotlin", q: "Зачем нужен inline и что такое reified?",
    what: "inline указывает компилятору вставить тело функции прямо в место вызова вместо реального вызова функции.",
    key: "Главная причина использовать inline для функций высшего порядка — убрать накладные расходы на создание объекта-лямбды (каждая lambda в Kotlin по умолчанию компилируется в анонимный класс). reified работает только у inline-функций и позволяет обращаться к типу T в рантайме (T::class, is T) — обычные generic-параметры стираются (type erasure) и это невозможно.",
    example: "inline fun <reified T> Gson.fromJson(json: String): T = fromJson(json, T::class.java) — без reified пришлось бы отдельно передавать Class<T> аргументом.",
    code: `inline fun <reified T> parseJson(json: String): T {
    return Gson().fromJson(json, T::class.java)
}

// Использование — тип T известен в рантайме благодаря reified
val user: User = parseJson(jsonString)`
  },
  {
    id: "k3", cat: "kotlin", q: "Что такое variance (in/out) и что такое PECS?",
    what: "Variance описывает, как соотносятся Generic<A> и Generic<B>, если сам A является подтипом B.",
    key: "out (ковариантность) — тип используется только на выход (producer), можно присвоить List<Cat> переменной List<Animal>. in (контравариантность) — тип используется только на вход (consumer), например Comparator<Animal> можно использовать там, где ждут Comparator<Cat>. PECS — мнемоника из Java (Producer Extends, Consumer Super), в Kotlin: Producer — out, Consumer — in.",
    example: "interface Source<out T> { fun next(): T } — T только возвращается (produce), поэтому safe объявить out.",
    code: `interface Source<out T> { fun next(): T }

val strings: Source<String> = TODO()
val objects: Source<Any> = strings // OK благодаря out

interface Comparator2<in T> { fun compare(a: T, b: T): Int }
val anyComparator: Comparator2<Any> = TODO()
val stringComparator: Comparator2<String> = anyComparator // OK благодаря in`
  },

  // ---------------- COROUTINES ----------------
  {
    id: "c1", cat: "coroutines", q: "coroutineScope vs supervisorScope — в чём разница?",
    what: "Обе функции создают дочерний scope и приостанавливают выполнение, пока все запущенные внутри корутины не завершатся.",
    key: "В coroutineScope падение любой дочерней корутины отменяет весь scope и все остальные дочерние корутины (fail-fast, структурная конкурентность). В supervisorScope падение одного child не влияет на остальных — исключение просто пробрасывается наверх через try/catch вокруг конкретного child.",
    example: "supervisorScope удобен, когда запускаешь несколько независимых загрузок (грузим погоду + грузим избранное) и падение одной не должно убивать вторую.",
    code: `// coroutineScope: одна упала — все отменились
suspend fun loadAll() = coroutineScope {
    val a = async { loadWeather() }   // если упадёт —
    val b = async { loadFavourites() } // b тоже отменится
    a.await() to b.await()
}

// supervisorScope: независимые дети
suspend fun loadAllSafely() = supervisorScope {
    val a = async { runCatching { loadWeather() } }
    val b = async { runCatching { loadFavourites() } }
    a.await() to b.await()
}`
  },
  {
    id: "c2", cat: "coroutines", q: "Как распространяется исключение из async?",
    what: "async возвращает Deferred, а исключение из его тела не выбрасывается сразу — оно сохраняется внутри Deferred.",
    key: "Если ты не вызовешь .await(), исключение из async 'молчит' до тех пор, пока родительский scope не завершится (в обычном coroutineScope оно всё равно распространится наверх немедленно из-за структурной конкурентности; но в GlobalScope/отдельном Job — может потеряться, если await() не вызван).",
    example: "Частая ошибка — запустить несколько async в supervisorScope и забыть await() хотя бы один: исключение может 'потеряться' и приложение не покажет ошибку.",
    code: `supervisorScope {
    val deferred = async { throw RuntimeException("boom") }
    // Если не вызвать deferred.await() — исключение может быть проглочено
    delay(100)
} // рискованно без await()`
  },
  {
    id: "c3", cat: "coroutines", q: "callbackFlow — это hot или cold Flow?",
    what: "callbackFlow — билдер для превращения callback-based API (например, слушатель Location или SDK с колбэками) в Flow.",
    key: "Сам по себе Flow, возвращаемый из callbackFlow, cold: код внутри блока callbackFlow выполняется заново при каждой новой подписке (каждый collect создаёт новый callback-подписчик). Это отличает его от SharedFlow/StateFlow, которые hot и не пересоздают источник данных на каждую подписку.",
    example: "Если два коллектора подпишутся на Flow из callbackFlow — они получат два независимых callback-listener'а, а не один общий поток данных.",
    code: `fun locationFlow(client: LocationClient): Flow<Location> = callbackFlow {
    val callback = object : LocationCallback() {
        override fun onLocation(loc: Location) { trySend(loc) }
    }
    client.requestUpdates(callback)
    awaitClose { client.removeUpdates(callback) } // очистка при отмене
}`
  },
  {
    id: "c4", cat: "coroutines", q: "Что такое структурная конкурентность (structured concurrency)?",
    what: "Принцип, при котором у каждой запущенной корутины есть родительский Job, и время жизни child-корутины ограничено временем жизни родителя.",
    key: "Ключевое следствие: нельзя 'потерять' корутину — если отменяется родитель, автоматически отменяются все дети; если падает child без supervisor, падает и родитель. Это заменяет ручное управление потоками/callback'ами (где легко забыть отменить фоновую задачу).",
    example: "viewModelScope — пример структурной конкурентности в Android: при уничтожении ViewModel scope отменяется, и все запущенные в нём корутины автоматически cancel'ятся.",
    code: `class MyViewModel : ViewModel() {
    fun load() {
        viewModelScope.launch { // child привязан к жизни ViewModel
            repository.getData()
        }
    } // при onCleared() viewModelScope.cancel() вызывается автоматически
}`
  },

  // ---------------- DI ----------------
  {
    id: "d1", cat: "di", q: "@Binds vs @Provides — в чём разница и зачем нужны оба?",
    what: "Оба используются в Dagger/Hilt-модулях, чтобы сказать графу зависимостей, как создать экземпляр интерфейса или класса.",
    key: "@Provides — обычный метод, ты руками пишешь логику создания объекта (может понадобиться, если конструктор внешний, например Retrofit.Builder). @Binds — абстрактный метод без тела, просто говорит Dagger 'если кто-то просит интерфейс X, отдай ему реализацию Y' — Dagger генерирует связывание на этапе компиляции без лишнего кода, это быстрее и компактнее, чем писать @Provides вручную для тривиального связывания interface -> impl.",
    example: "Правило: если у тебя есть готовый конструктор класса-реализации — используй @Binds. Если объект нужно собрать вручную (билдеры, статические фабрики сторонних библиотек) — @Provides.",
    code: `@Module
@InstallIn(SingletonComponent::class)
abstract class RepoModule {
    @Binds
    abstract fun bindWeatherRepo(impl: WeatherRepositoryImpl): WeatherRepository
}

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    fun provideRetrofit(): Retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .build()
}`
  },
  {
    id: "d2", cat: "di", q: "Lazy<T> vs Provider<T> в Dagger — зачем нужны?",
    what: "Оба — обёртки, которые Dagger умеет инжектить вместо самого объекта T, откладывая момент его создания.",
    key: "Lazy<T> создаёт объект один раз при первом вызове .get() и кеширует его (даже если сам binding не @Singleton). Provider<T> создаёт новый экземпляр при каждом вызове .get() — полезно для объектов, которые должны быть разными при каждом использовании (например, разные ViewHolder'ы).",
    example: "Lazy<ExpensiveObject> — если объект дорогой в создании и нужен не всегда (например, тяжёлый парсер, который используется в 1 из 10 сценариев экрана).",
    code: `class ReportScreen @Inject constructor(
    private val heavyParser: Lazy<HeavyPdfParser> // не создастся, пока не вызовем .get()
) {
    fun onExportClicked() {
        heavyParser.get().parse() // создаётся здесь, один раз
    }
}`
  },
  {
    id: "d3", cat: "di", q: "Зачем нужен @AssistedInject?",
    what: "Механизм Dagger/Hilt для случая, когда часть параметров конструктора должна приходить из графа DI, а часть — передаваться вручную в рантайме (например, id элемента, полученный от навигации).",
    key: "Обычный @Inject-конструктор не умеет принимать 'ручные' параметры, которые не являются частью графа зависимостей. @AssistedInject решает это: часть параметров помечается @Assisted и передаётся через сгенерированную Factory, остальное Dagger подставляет сам.",
    example: "ViewModel, которому нужен itemId из аргументов навигации, но также нужен Repository из графа DI — классический кейс для @AssistedInject.",
    code: `class DetailViewModel @AssistedInject constructor(
    @Assisted private val itemId: String,
    private val repository: WeatherRepository // из графа DI
) : ViewModel() {

    @AssistedFactory
    interface Factory {
        fun create(itemId: String): DetailViewModel
    }
}`
  },

  // ---------------- ANDROID ----------------
  {
    id: "a1", cat: "android", q: "Как Handler может привести к утечке памяти в Activity?",
    what: "Handler, созданный как non-static inner class внутри Activity, неявно хранит ссылку на внешний класс (this@Activity) через синтетическое поле this$0.",
    key: "Если Handler используется для отложенного сообщения (postDelayed) и Activity уничтожается до того, как сообщение обработано, Message в очереди MessageQueue продолжает держать ссылку на Handler -> Handler держит ссылку на Activity -> GC не может собрать Activity, пока очередь не разгребётся или процесс не убьют. Решение: static class + WeakReference<Activity>, либо отменять сообщения в onDestroy (removeCallbacksAndMessages).",
    example: "postDelayed на 30 секунд + пользователь быстро закрыл экран — Activity 'подвисает' в памяти ещё 30 секунд как минимум.",
    code: `// Плохо: implicit ссылка на Activity
class MainActivity : AppCompatActivity() {
    private val handler = Handler(Looper.getMainLooper())
    // handler.postDelayed({ ... }, 30_000) — держит this@MainActivity
}

// Хорошо: WeakReference + static-подобный класс
class SafeHandler(activity: MainActivity) : Handler(Looper.getMainLooper()) {
    private val ref = WeakReference(activity)
    override fun handleMessage(msg: Message) {
        ref.get()?.let { /* безопасно, может быть null */ }
    }
}
// + в onDestroy(): handler.removeCallbacksAndMessages(null)`
  },
  {
    id: "a2", cat: "android", q: "Room: @Embedded, @ForeignKey, @Relation — зачем каждая нужна?",
    what: "Три разные аннотации Room для работы со связанными данными между таблицами/объектами.",
    key: "@Embedded — 'разворачивает' поля вложенного объекта прямо в колонки той же таблицы (просто композиция данных, никакой связи между таблицами). @ForeignKey — реальное ограничение целостности на уровне SQLite между двумя таблицами (например, CASCADE при удалении родителя). @Relation — говорит Room, как собрать граф объектов out-of-the-box при чтении (one-to-many), генерируя дополнительный запрос под капотом.",
    example: "@Embedded — Address внутри User в одной таблице users. @ForeignKey + @Relation — City как отдельная таблица, где у User есть cityId, и Room сам подтянет список City при запросе.",
    code: `data class User(
    @Embedded val address: Address, // разворачивается в колонки таблицы users
    val cityId: Long
)

@Entity(
    foreignKeys = [ForeignKey(
        entity = City::class,
        parentColumns = ["id"], childColumns = ["cityId"],
        onDelete = ForeignKey.CASCADE
    )]
)
data class UserEntity(val cityId: Long, /* ... */)

data class UserWithCity(
    @Embedded val user: UserEntity,
    @Relation(parentColumn = "cityId", entityColumn = "id")
    val city: City
)`
  },
  {
    id: "a3", cat: "android", q: "Как работает DiffUtil и зачем он нужен?",
    what: "DiffUtil — утилита, которая сравнивает два списка (старый и новый) и вычисляет минимальный набор операций (insert/remove/move/change), чтобы обновить RecyclerView.",
    key: "Под капотом используется алгоритм на основе longest common subsequence (по сути вариация алгоритма Майерса), работающий за O(N + D²) в среднем, где D — количество различий. Ключевое отличие от notifyDataSetChanged() — DiffUtil даёт точечные анимации обновления вместо полной перерисовки списка, и не сбрасывает scroll-позицию.",
    example: "ListAdapter<T, VH> уже использует AsyncListDiffer (DiffUtil на фоновом потоке) под капотом, поэтому в 95% случаев не нужно вызывать DiffUtil.calculateDiff() руками.",
    code: `class ItemDiffCallback : DiffUtil.ItemCallback<Item>() {
    override fun areItemsTheSame(old: Item, new: Item) = old.id == new.id
    override fun areContentsTheSame(old: Item, new: Item) = old == new // data class
}

class ItemAdapter : ListAdapter<Item, ItemViewHolder>(ItemDiffCallback()) {
    // submitList() сам считает diff в фоне и анимирует изменения
}`
  },

  // ---------------- ARCHITECTURE ----------------
  {
    id: "ar1", cat: "arch", q: "MVVM vs MVI — в чём принципиальная разница?",
    what: "Оба паттерна разделяют UI (View) и логику (ViewModel/Model), но по-разному описывают, как View получает и меняет состояние.",
    key: "В MVVM у ViewModel обычно много независимых LiveData/StateFlow полей (isLoading, error, data...), и View сама комбинирует их. В MVI — одно неделимое State (Reducer собирает предыдущий State + Event/Intent -> новый State), поток данных строго однонаправленный (Unidirectional Data Flow): Intent -> Reducer -> State -> View -> новый Intent. MVI жёстче ограничивает, где меняется состояние, что упрощает отладку сложных экранов, но добавляет boilerplate для простых.",
    example: "Реальный признак MVI в коде — sealed class Event/Intent и единственный StateFlow<State>, а не россыпь отдельных полей.",
    code: `// MVI: единое состояние + Reducer
data class ScreenState(val isLoading: Boolean = false, val items: List<Item> = emptyList())
sealed interface ScreenEvent { data object Refresh : ScreenEvent }

class ScreenViewModel : ViewModel() {
    private val _state = MutableStateFlow(ScreenState())
    val state = _state.asStateFlow()

    fun onEvent(event: ScreenEvent) = when (event) {
        is ScreenEvent.Refresh -> reduce { it.copy(isLoading = true) }
    }
    private fun reduce(block: (ScreenState) -> ScreenState) { _state.update(block) }
}`
  },
  {
    id: "ar2", cat: "arch", q: "Правило зависимостей в Clean Architecture — как объяснить просто?",
    what: "Приложение делится на слои (Presentation -> Domain -> Data), и зависимости кода могут указывать только 'внутрь', к Domain.",
    key: "Domain-слой (Entities, UseCases, интерфейсы Repository) не должен знать вообще ничего ни про Android SDK, ни про конкретную БД/сеть — он чистый Kotlin. Data-слой реализует интерфейсы из Domain (Dependency Inversion, D из SOLID), а не наоборот. Это позволяет подменить источник данных (Room -> SQLDelight) не трогая бизнес-логику.",
    example: "Если в UseCase импортируется android.content.Context — это нарушение правила зависимостей, тревожный звоночек на собеседовании.",
    code: `// domain — чистый Kotlin, никакого Android
interface WeatherRepository { suspend fun getWeather(city: String): Weather }
class GetWeatherUseCase(private val repo: WeatherRepository) {
    suspend operator fun invoke(city: String) = repo.getWeather(city)
}

// data — реализует интерфейс из domain (Dependency Inversion)
class WeatherRepositoryImpl(private val api: WeatherApi) : WeatherRepository {
    override suspend fun getWeather(city: String) = api.fetch(city).toDomain()
}`
  },

  // ---------------- TESTING (пробелы — учить с нуля) ----------------
  {
    id: "t1", cat: "testing", q: "runTest и StandardTestDispatcher — зачем и как связаны с корутинами?",
    what: "runTest — билдер для тестирования suspend-функций, который выполняет корутину в контролируемом виртуальном времени.",
    key: "Ключевая проблема без runTest: delay(10_000) в тесте реально ждал бы 10 секунд. runTest автоматически пропускает delay, продвигая виртуальное время мгновенно. StandardTestDispatcher — диспетчер по умолчанию внутри runTest, который не начинает корутину сразу при launch, а ставит её в очередь — нужно вызвать advanceUntilIdle() / runCurrent(), чтобы она реально выполнилась (это специально, чтобы тест мог проверить промежуточное состояние ДО завершения корутины).",
    example: "Если тест 'зависает' без ошибки — почти всегда забыт advanceUntilIdle() или используется реальный Dispatchers.IO вместо inject-нутого тестового диспетчера.",
    code: `@Test
fun \`loading state shows before data\`() = runTest {
    val viewModel = MyViewModel(fakeRepo, StandardTestDispatcher(testScheduler))
    viewModel.load()
    assertEquals(true, viewModel.state.value.isLoading) // до advance — ещё грузится
    advanceUntilIdle()
    assertEquals(false, viewModel.state.value.isLoading) // после — уже готово
}`
  },
  {
    id: "t2", cat: "testing", q: "Turbine — зачем он нужен, если можно просто собрать Flow в список?",
    what: "Turbine — библиотека для тестирования Flow, дающая явный API для 'ожидания' следующих эмиссий вместо ручного toList().",
    key: "Проблема toList() на 'бесконечном' Flow (например, StateFlow) — тест никогда не завершится, потому что Flow не закрывается сам. Turbine даёт test { }-блок с awaitItem() / awaitComplete() / awaitError(), где ты явно говоришь, сколько элементов ждать, и точно ловишь неожиданные лишние эмиссии как ошибку теста.",
    example: "viewModel.state.test { assertEquals(loadingState, awaitItem()); assertEquals(successState, awaitItem()) } — тест явно проверяет последовательность состояний, а не просто финальный результат.",
    code: `@Test
fun \`emits loading then success\`() = runTest {
    viewModel.state.test {
        assertEquals(ScreenState(isLoading = false), awaitItem()) // начальное
        viewModel.onEvent(ScreenEvent.Refresh)
        assertEquals(ScreenState(isLoading = true), awaitItem())
        assertEquals(ScreenState(isLoading = false, items = fakeItems), awaitItem())
        cancelAndIgnoreRemainingEvents()
    }
}`
  },
  {
    id: "t3", cat: "testing", q: "Mockito: mock() vs verify() vs when() — базовая механика",
    what: "Mockito — библиотека для создания фейковых реализаций (mock) зависимостей, чтобы тестировать класс изолированно от его реальных коллабораторов.",
    key: "mock() создаёт объект-заглушку, все методы которого по умолчанию 'ничего не делают' (возвращают null/0/false). whenever(...).thenReturn(...) настраивает, что мок должен вернуть на конкретный вызов (стаб). verify(mock).method() проверяет постфактум, что метод действительно был вызван — это отдельная задача от стаба, стаб отвечает 'что вернуть', verify — 'было ли обращение'.",
    example: "Частая путаница на собесе: verify не настраивает поведение, а только проверяет факт вызова — это два разных этапа теста (Arrange/stub -> Act -> Assert/verify).",
    code: `@Test
fun \`loads weather from repository\`() = runTest {
    val repo = mock<WeatherRepository>()
    whenever(repo.getWeather("Rostov")).thenReturn(fakeWeather)

    val useCase = GetWeatherUseCase(repo)
    val result = useCase("Rostov")

    assertEquals(fakeWeather, result)
    verify(repo).getWeather("Rostov") // проверяем, что вызов реально был
}`
  },

  // ---------------- ALGORITHMS (пробел — критично для Тинькофф/Озон) ----------------
  {
    id: "al1", cat: "algo", q: "Как вообще подступиться к алгоритмам, если начинаю с нуля?",
    what: "Для Middle Android чаще всего спрашивают не олимпиадные задачи, а базовые структуры данных + типовые паттерны (two pointers, sliding window, DFS/BFS на дереве/графе, простая динамика).",
    key: "Приоритет для тебя (учитывая, что это критичный пробел): 1) Массивы/строки — two pointers, sliding window. 2) HashMap-based задачи (у тебя уже сильное понимание HashMap внутри — используй это). 3) Деревья/графы — обход DFS/BFS (пригодится и для понимания Compose recomposition tree, кстати). 4) Базовая DP (Fibonacci-подобные, знакомые паттерны).",
    example: "LeetCode Easy/Medium с тегами 'Array', 'Hash Table', 'Two Pointers', 'Tree' — закрывают большую часть реальных собесов уровня Middle в Т-Банк/Авито.",
    code: `// Пример на разминку: Two Sum через HashMap — O(n) вместо O(n^2)
fun twoSum(nums: IntArray, target: Int): IntArray {
    val seen = HashMap<Int, Int>() // значение -> индекс
    nums.forEachIndexed { i, n ->
        val need = target - n
        seen[need]?.let { return intArrayOf(it, i) }
        seen[n] = i
    }
    return intArrayOf()
}`
  },

  // ---------------- JAVA ----------------
  {
    id: "j1", cat: "java", q: "Что такое GC Roots и типы ссылок (Strong/Soft/Weak/Phantom)?",
    what: "GC Roots — это 'точки отсчёта', от которых сборщик мусора (Garbage Collector) строит граф достижимых объектов: статические поля, локальные переменные активных потоков, JNI-ссылки.",
    key: "Объект жив, пока до него есть путь от GC Root по строгим (Strong) ссылкам. Soft-ссылки удаляются только при угрозе OutOfMemory. Weak-ссылки удаляются при любом проходе GC (пример: WeakReference на Activity в Handler). Phantom-ссылки нужны только чтобы узнать момент фактического удаления объекта из памяти (для точной очистки внешних ресурсов), сам объект через них даже прочитать нельзя.",
    example: "Циклическая ссылка (A хранит B, B хранит A) не мешает GC — если ни на A, ни на B нет пути от GC Root, весь цикл соберётся целиком, в отличие от простого reference counting.",
    code: `class Cache {
    // Soft — удалится сборщиком только при риске OOM, подходит для кэша
    private val cache = HashMap<String, SoftReference<Bitmap>>()

    // Weak — удалится при любой сборке мусора, подходит для утечкоопасных ссылок
    private val listeners = mutableListOf<WeakReference<Listener>>()
}`
  },
  {
    id: "j2", cat: "java", q: "Контракт equals() и hashCode() — почему нельзя переопределить только один?",
    what: "equals() определяет логическое равенство объектов, hashCode() — число для быстрого распределения объекта по 'корзинам' (bucket) в хэш-коллекциях (HashMap, HashSet).",
    key: "Контракт: если a.equals(b) == true, то ОБЯЗАТЕЛЬНО a.hashCode() == b.hashCode(). Обратное не гарантируется (коллизии допустимы). Если переопределить только equals — два 'равных' объекта могут попасть в разные bucket'ы, и HashMap.get() их не найдёт, потому что сначала ищет bucket по hashCode, и только потом сверяет через equals внутри него.",
    example: "data class в Kotlin решает это автоматически, генерируя согласованную пару equals/hashCode — частая ошибка на собесе объяснить это без слова 'контракт'.",
    code: `class BadKey(val id: Int) {
    override fun equals(other: Any?) = other is BadKey && other.id == id
    // hashCode НЕ переопределён — использует адрес объекта по умолчанию!
}

val map = HashMap<BadKey, String>()
map[BadKey(1)] = "value"
map[BadKey(1)] // null! Разные hashCode -> разные bucket'ы -> equals даже не проверяется`
  },
  {
    id: "j3", cat: "java", q: "Почему в Kotlin нет checked exceptions, как в Java?",
    what: "В Java checked exceptions (например, IOException) компилятор заставляет либо ловить, либо явно указывать в сигнатуре метода (throws). В Kotlin такого разделения нет — все исключения unchecked.",
    key: "Плюс: не нужно засорять сигнатуры try/catch ради компилятора там, где реальной обработки нет (частая практика в Java — пустой catch, лишь бы скомпилировалось). Минус: компилятор больше не подскажет, что функция может бросить исключение — приходится либо читать документацию/тело, либо закладывать явную обработку через типы (sealed class Result<T>) вместо exceptions.",
    example: "Современный подход в Kotlin — вместо exceptions для ожидаемых ошибок (нет сети, невалидные данные) использовать sealed-иерархию Result/Success/Error, оставляя exceptions только для реально исключительных ситуаций.",
    code: `sealed interface ApiResult<out T> {
    data class Success<T>(val data: T): ApiResult<T>
    data class Error(val message: String): ApiResult<Nothing>
}
// Явно видно из сигнатуры, что может пойти не так — без throws в стиле Java`
  },

  // ---------------- ANDROID SDK (доп.) ----------------
  {
    id: "a4", cat: "android", q: "Почему у Bundle есть лимит на объём передаваемых данных (~1-2 МБ)?",
    what: "Bundle используется не только внутри одного процесса — при передаче данных между Activity/процессами (и даже просто при пересоздании Activity системой) он сериализуется через транзакцию Binder — механизм межпроцессного взаимодействия (IPC) в Android.",
    key: "У Binder-транзакций есть фиксированный буфер (около 1 МБ на процесс, точное число варьируется по версии Android), которым делятся ВСЕ одновременные транзакции приложения. Превышение лимита выбрасывает TransactionTooLargeException. Это ограничение самого механизма IPC, а не 'жадности' Bundle.",
    example: "Частая ошибка — передавать Bitmap напрямую через Intent extras: даже одна фотография с камеры легко превышает лимит. Правильно — сохранить во временный файл и передать Uri.",
    code: `// Плохо: может упасть с TransactionTooLargeException
intent.putExtra("photo", bitmap)

// Хорошо: передаём ссылку на файл, а не сами данные
val uri = saveBitmapToCache(bitmap)
intent.putExtra("photoUri", uri)`
  },
  {
    id: "a5", cat: "android", q: "Чем отличаются launchMode: standard, singleTop, singleTask, singleInstance?",
    what: "launchMode в манифесте управляет тем, как система создаёт новый экземпляр Activity и куда помещает его в стеке задач (back stack), когда её запускают через Intent.",
    key: "standard — всегда создаёт новый экземпляр, даже поверх такого же. singleTop — не создаёт новый, если та же Activity уже на вершине стека (просто вызывает onNewIntent). singleTask — Activity существует в единственном экземпляре в рамках задачи, все Activity над ней в стеке уничтожаются при повторном открытии. singleInstance — как singleTask, но Activity живёт в отдельной, изолированной задаче, куда не может попасть никакая другая Activity.",
    example: "singleTop типично используют для экрана поиска (повторный тап на уведомление с тем же контентом не должен плодить дубли экрана), singleTask — для точки входа вроде главного экрана.",
    code: null
  },
  {
    id: "a6", cat: "android", q: "Как система решает, какое приложение убить первым при нехватке памяти?",
    what: "Android использует систему приоритетов процессов (process importance hierarchy) — чем 'важнее' процесс для пользователя прямо сейчас, тем позже его убьют при нехватке памяти (Low Memory Killer).",
    key: "Порядок примерно такой (от самого защищённого к самому уязвимому): Foreground process (видимая Activity/Foreground Service) → Visible process (частично видимый, например за диалогом) → Service process → Background process (свёрнутое приложение) → Empty process. Foreground Service поднимает приоритет процесса именно потому, что переводит его в защищённую категорию.",
    example: "Именно поэтому для геолокации в реальном времени (такси, доставка) используют Foreground Service с уведомлением — обычный Background Service система может убить в любой момент.",
    code: null
  },

  // ---------------- ВЬЮ XML ----------------
  {
    id: "vx1", cat: "viewxml", q: "Как обновить только один элемент списка (например, чекбокс), не перерисовывая весь item?",
    what: "DiffUtil по умолчанию сравнивает старый и новый item целиком и решает — перерисовать весь item или нет. Payloads — механизм частичного обновления, когда меняется только часть данных внутри item.",
    key: "Если areContentsTheSame() возвращает false, DiffUtil может передать в getChangePayload() конкретный объект-подсказку (например, строку 'checkbox_changed'). В onBindViewHolder с параметром payloads адаптер проверяет: если payload не пуст — обновляет только нужное View (checkbox.isChecked = ...) без пересоздания и переизмерения всего item.",
    example: "Без Payloads: изменение одного чекбокса в списке банковских карт перерисовывает всю сложную вёрстку item (иконки, текст, тени) — заметное проседание FPS на длинных списках.",
    code: `override fun onBindViewHolder(holder: VH, position: Int, payloads: List<Any>) {
    if (payloads.isNotEmpty() && payloads[0] == "checkbox_changed") {
        holder.checkbox.isChecked = getItem(position).isChecked
        return // не трогаем остальные вьюхи item'а
    }
    super.onBindViewHolder(holder, position, payloads)
}`
  },
  {
    id: "vx2", cat: "viewxml", q: "invalidate() vs requestLayout() — в чём разница?",
    what: "Обе функции просят View обновиться, но запускают разные части цикла отрисовки (Measure → Layout → Draw).",
    key: "invalidate() помечает View 'грязной' и запускает только повторный onDraw() — используется, когда изменился визуальный контент, но не размер/позиция (например, цвет фона). requestLayout() запускает полный цикл заново — onMeasure() и onLayout(), а затем обычно и onDraw() — нужен, когда изменился размер или положение View.",
    example: "Важный нюанс с собеса: вызов invalidate() НЕ гарантирует немедленный вызов onDraw() — система может батчить несколько invalidate() в один кадр отрисовки.",
    code: `// Изменился только цвет — достаточно invalidate()
fun setHighlightColor(color: Int) {
    this.color = color
    invalidate() // просит только перерисовать
}

// Изменился текст, который может повлиять на размер — нужен requestLayout()
fun setText(text: String) {
    this.text = text
    requestLayout() // просит пересчитать размер и позицию заново
}`
  },
  {
    id: "vx3", cat: "viewxml", q: "Почему ViewBinding нужно обнулять в onDestroyView() у Fragment, а у Activity — нет?",
    what: "ViewBinding хранит ссылки на все View конкретной иерархии разметки (inflated View hierarchy).",
    key: "У Fragment есть два разных жизненных цикла: жизненный цикл самого Fragment-объекта и жизненный цикл его View (View lifecycle) — View может быть уничтожена (onDestroyView) и создана заново (например, при возврате из backstack), пока сам Fragment остаётся жив в памяти. Если не обнулить binding в onDestroyView, он продолжает держать ссылку на уже уничтоженную иерархию View — это утечка памяти. У Activity View и сама Activity уничтожаются одновременно, поэтому отдельно обнулять нечего.",
    example: "Частый паттерн — nullable backing property (_binding) + non-null геттер (binding), который бросает исключение при обращении вне жизненного цикла View.",
    code: `private var _binding: FragmentDetailBinding? = null
private val binding get() = _binding!!

override fun onDestroyView() {
    super.onDestroyView()
    _binding = null // разрываем ссылку на уничтоженную View-иерархию
}`
  },

  // ---------------- COMPOSE ----------------
  {
    id: "cx1", cat: "compose", q: "LaunchedEffect vs DisposableEffect vs SideEffect — когда что использовать?",
    what: "Все три — side-effect API в Compose для выполнения кода вне обычного процесса рекомпозиции (recomposition — процесс пересчёта UI при изменении State).",
    key: "LaunchedEffect(key) — запускает suspend-корутину при входе в композицию или при смене key, отменяет её при выходе. DisposableEffect(key) — для эффектов, которым нужна явная очистка (отписка от слушателя) через блок onDispose, не связан с корутинами. SideEffect — выполняется при КАЖДОЙ успешной рекомпозиции, без привязки к ключам и без возможности отмены — обычно для синхронизации Compose-состояния с не-Compose кодом (аналитика, старый View-based SDK).",
    example: "Задача 'отследить момент появления баннера на экране для метрики' — это DisposableEffect (нужен onDispose при исчезновении), а 'загрузить данные при открытии экрана' — LaunchedEffect(Unit).",
    code: `// Запуск и отмена корутины
LaunchedEffect(userId) {
    viewModel.loadUser(userId)
}

// Подписка + обязательная очистка
DisposableEffect(lifecycleOwner) {
    val observer = LifecycleEventObserver { _, event -> /* ... */ }
    lifecycleOwner.lifecycle.addObserver(observer)
    onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
}`
  },
  {
    id: "cx2", cat: "compose", q: "Что такое стабильность типов в Compose (@Stable/@Immutable) и почему List — нестабильный тип?",
    what: "Compose пропускает рекомпозицию Composable-функции, если все её параметры 'стабильны' и не изменились между вызовами. Стабильность — это гарантия компилятору, что при equals()==true визуальное представление объекта не изменилось.",
    key: "List — это интерфейс в Kotlin, и Compose не может гарантировать, что конкретная реализация за ним иммутабельна (кто-то может передать MutableList и незаметно поменять его содержимое без пересоздания ссылки) — поэтому компилятор Compose считает List нестабильным и на всякий случай перезапускает рекомпозицию при каждом изменении состояния родителя, даже если сам список не менялся. Аннотации @Immutable/@Stable — явное обещание разработчика компилятору, что тип ведёт себя стабильно.",
    example: "Решения: обернуть список в @Immutable data class-обёртку, использовать kotlinx.collections.immutable (ImmutableList), либо настроить Stability Configuration File для сторонних классов, которые нельзя аннотировать напрямую.",
    code: `@Immutable
data class UiState(val items: List<Item>) // явно говорим Compose: доверяй этому классу

@Composable
fun ItemList(state: UiState) {
    // Compose теперь может пропускать лишние рекомпозиции для state.items
}`
  },
  {
    id: "cx3", cat: "compose", q: "Зачем нужен derivedStateOf?",
    what: "derivedStateOf создаёт State, значение которого вычисляется из других State, но рекомпозиция триггерится только когда РЕЗУЛЬТАТ вычисления реально изменился — а не каждый раз, когда меняется исходное состояние.",
    key: "Без derivedStateOf: если завязать Composable на 'сырое' состояние скролла (например, firstVisibleItemIndex, которое меняется на каждый пиксель), рекомпозиция будет происходить сотни раз за один жест скролла. derivedStateOf пересчитывает производное значение (например, 'показывать кнопку scroll-to-top: true/false') и триггерит рекомпозицию только когда именно это булево значение меняется.",
    example: "Классический пример — показ FAB 'наверх' в списке: сырой индекс скролла меняется постоянно, а булево 'показывать/скрывать кнопку' — редко.",
    code: `val showButton by remember {
    derivedStateOf { listState.firstVisibleItemIndex > 0 }
} // Рекомпозиция только когда showButton реально меняет значение true/false`
  },

  // ---------------- FLOW ----------------
  {
    id: "fl1", cat: "flow", q: "StateFlow vs SharedFlow — в чём разница и когда каждый может 'подвести'?",
    what: "Оба — горячие (hot) реализации Flow: существуют независимо от подписчиков и не пересоздают источник данных на каждую подписку.",
    key: "StateFlow всегда хранит РОВНО одно последнее значение (обязателен initial value) и отдаёт его немедленно каждому новому подписчику — по сути, реактивный аналог переменной. SharedFlow гибче: можно настроить replay (сколько последних значений отдавать новому подписчику, по умолчанию 0) и не требует начального значения — подходит для одноразовых событий (показать Toast, навигация), которые не должны 'залипать' как состояние.",
    example: "Классическая ловушка с собеса: если хранить событие 'показать Alert' в StateFlow, при повороте экрана (пересоздании подписчика) Alert покажется повторно, потому что StateFlow отдаёт своё последнее значение заново. Для одноразовых событий правильнее SharedFlow с replay = 0.",
    code: `// StateFlow — для состояния экрана (нужно последнее значение всегда)
val uiState: StateFlow<ScreenState> = _uiState.asStateFlow()

// SharedFlow с replay=0 — для одноразовых событий (навигация, снекбар)
private val _events = MutableSharedFlow<UiEvent>(replay = 0)
val events = _events.asSharedFlow()`
  },
  {
    id: "fl2", cat: "flow", q: "Чем flowOn концептуально отличается от observeOn в RxJava?",
    what: "Оба меняют диспетчер/поток выполнения для цепочки операций, но действуют в разных направлениях относительно места вызова.",
    key: "observeOn в RxJava меняет поток для ВСЕХ операторов НИЖЕ по цепочке (после вызова). flowOn в Kotlin Flow работает наоборот — меняет диспетчер для операторов ВЫШЕ по цепочке (до места вызова flowOn), а всё что идёт после него (включая collect) выполняется на диспетчере, откуда пришёл вызов.",
    example: "Если в цепочке несколько flowOn с разными диспетчерами, каждый влияет только на участок цепочки выше себя и ниже предыдущего flowOn — это часто путает разработчиков с опытом в RxJava.",
    code: `flow {
    emit(loadFromNetwork()) // выполнится на IO
}
.flowOn(Dispatchers.IO) // диспетчер для всего, что выше
.map { heavyCpuTransform(it) } // выполнится на диспетчере вызывающего (например, Main)
.collect { updateUi(it) }`
  },

  // ---------------- КОНКУРЕНТНОСТЬ/МНОГОПОТОЧНОСТЬ ----------------
  {
    id: "conc1", cat: "concurrency", q: "Как работает synchronized 'под капотом' и что такое монитор?",
    what: "synchronized — механизм JVM для взаимоисключающего доступа к общему ресурсу через объект-монитор (intrinsic lock), встроенный в каждый Java/Kotlin-объект.",
    key: "Для synchronized-метода монитором выступает сам объект (this), для синхронизированного статического метода — объект класса (Class). Поток, зашедший в synchronized-блок, захватывает монитор; другие потоки, пытающиеся войти в ЛЮБОЙ synchronized-блок с тем же монитором, блокируются до освобождения. Важный нюанс: synchronized реентерабелен — поток, уже владеющий монитором, может повторно войти в другой synchronized-блок того же объекта без самоблокировки.",
    example: "synchronized(lockObject) { ... } на конкретном объекте-мьютексе — более узкая и производительная синхронизация, чем synchronized на весь метод, если реально нужно защитить только часть логики.",
    code: `class Counter {
    private var count = 0
    private val lock = Any()

    fun increment() {
        synchronized(lock) { // монитор — именно объект lock, а не this
            count++
        }
    }
}`
  },
  {
    id: "conc2", cat: "concurrency", q: "Что именно даёт ключевое слово volatile?",
    what: "volatile — модификатор поля, гарантирующий видимость (visibility) изменений между потоками и запрещающий переупорядочивание инструкций (instruction reordering) компилятором/процессором вокруг этого поля.",
    key: "Без volatile поток может закэшировать значение переменной в своём процессорном кэше/регистре и не увидеть изменение, сделанное другим потоком (например, в бесконечном while-цикле проверки флага). volatile заставляет читать и писать значение напрямую из основной памяти (main memory), минуя локальный кэш потока. Важно: volatile НЕ даёт атомарности составных операций (например, count++ — это чтение+инкремент+запись, три отдельных шага, между которыми другой поток может вклиниться).",
    example: "Именно поэтому volatile хорош для простого флага-сигнала (@Volatile var isRunning = true), но не годится для счётчика — для него нужны Atomic-типы или synchronized.",
    code: `class Worker {
    @Volatile private var isRunning = true // видимость гарантирована

    fun stop() { isRunning = false } // из одного потока
    fun run() {
        while (isRunning) { /* ... */ } // из другого потока увидит изменение сразу
    }
}`
  },
  {
    id: "conc3", cat: "concurrency", q: "Что такое Deadlock и как его избежать?",
    what: "Deadlock (взаимная блокировка) — ситуация, когда два (или более) потока бесконечно ждут друг друга, каждый удерживая ресурс, нужный другому.",
    key: "Классический сценарий: поток A захватил монитор объекта X и ждёт монитор объекта Y; поток B в это же время захватил монитор Y и ждёт монитор X. Ни один не может продолжить. Способы избежать: всегда захватывать несколько локов в едином согласованном порядке во всём приложении; использовать тайм-ауты при попытке захвата (tryLock с timeout); по возможности проектировать код без вложенных блокировок вообще.",
    example: "На собесе часто просят смоделировать: два метода переводят деньги между счетами A→B и B→A одновременно, каждый сначала блокирует 'свой' счёт — классический рецепт deadlock, если не зафиксировать порядок захвата (например, всегда сначала счёт с меньшим ID).",
    code: `// Плохо: порядок захвата зависит от направления перевода — риск deadlock
fun transfer(from: Account, to: Account, amount: Int) {
    synchronized(from) {
        synchronized(to) { /* ... */ }
    }
}

// Хорошо: всегда фиксированный порядок (например, по ID)
fun transferSafe(a: Account, b: Account, amount: Int) {
    val (first, second) = if (a.id < b.id) a to b else b to a
    synchronized(first) {
        synchronized(second) { /* ... */ }
    }
}`
  },

  // ---------------- DAGGER (доп.) ----------------
  {
    id: "d4", cat: "di", q: "Как через Dagger Multibindings очистить данные во всех репозиториях разом при логауте?",
    what: "Multibindings (@IntoSet, @IntoMap) — механизм Dagger для сборки коллекции объектов от РАЗНЫХ модулей/классов под одним общим типом, без ручного перечисления всех реализаций в одном месте.",
    key: "Каждый репозиторий реализует общий интерфейс (например, Clearable с методом clear()) и биндится в Set через @IntoSet. При логауте достаточно заинжектить Set<Clearable> и пройтись циклом — не нужно руками дописывать вызов clear() для каждого нового репозитория, который появится в будущем.",
    example: "Это прямое применение Open/Closed принципа (O из SOLID) — добавление нового репозитория не требует изменения кода логаута, только реализации интерфейса и биндинга.",
    code: `interface Clearable { fun clear() }

@Module
abstract class RepoModule {
    @Binds @IntoSet
    abstract fun bindUserRepoClearable(impl: UserRepositoryImpl): Clearable

    @Binds @IntoSet
    abstract fun bindCacheRepoClearable(impl: CacheRepositoryImpl): Clearable
}

class LogoutUseCase @Inject constructor(
    private val clearables: Set<@JvmSuppressWildcards Clearable>
) {
    operator fun invoke() = clearables.forEach { it.clear() }
}`
  },

  // ---------------- HILT ----------------
  {
    id: "hilt1", cat: "hilt", q: "Что делают @HiltAndroidApp и @AndroidEntryPoint и зачем нужны готовые компоненты Hilt?",
    what: "Hilt — надстройка над Dagger, которая берёт на себя написание бойлерплейт-кода (шаблонного кода) для стандартных Android-компонентов.",
    key: "@HiltAndroidApp на классе Application генерирует корневой DI-граф приложения. @AndroidEntryPoint на Activity/Fragment/Service подключает их к этому графу и позволяет использовать @Inject прямо в полях. Вместо ручного написания Component/Subcomponent под каждый экран (как в чистом Dagger), Hilt уже предоставляет готовые компоненты с правильной иерархией и временем жизни: SingletonComponent (на всё приложение), ActivityComponent, ViewModelComponent, FragmentComponent и т.д.",
    example: "Цена удобства: на очень крупных проектах (100+ модулей, 25 тыс.+ строк в сабкомпонентах) кодогенерация Hilt может заметно замедлять сборку — поэтому банки с гигантскими монолитами (пример из разбора Дом.РФ) иногда сознательно остаются на чистом Dagger.",
    code: `@HiltAndroidApp
class MyApplication : Application()

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    @Inject lateinit var repository: WeatherRepository // Hilt сам заинжектит
}

@HiltViewModel
class MainViewModel @Inject constructor(
    private val repository: WeatherRepository
) : ViewModel()`
  },

  // ---------------- ПАТТЕРНЫ ----------------
  {
    id: "pat1", cat: "patterns", q: "Как правильно реализовать Singleton с двойной проверкой (Double-Checked Locking) и зачем там volatile?",
    what: "Double-Checked Locking — оптимизация ленивой инициализации синглтона: проверяем, создан ли объект, ДО захвата дорогого synchronized-блока, и ещё раз ПОСЛЕ входа в него (на случай если другой поток создал объект, пока мы ждали лока).",
    key: "Без volatile на поле экземпляра компилятор/процессор может переупорядочить инструкции создания объекта так, что другой поток увидит ссылку на ещё не до конца инициализированный объект (instruction reordering) — редкий, но реальный баг. volatile гарантирует, что присвоение ссылки станет видно другим потокам только ПОСЛЕ полного завершения конструктора.",
    example: "В Kotlin эта проблема решается проще и безопаснее через object (компилятор сам гарантирует потокобезопасную однократную инициализацию) или through by lazy(LazyThreadSafetyMode.SYNCHRONIZED).",
    code: `class Singleton private constructor() {
    companion object {
        @Volatile private var instance: Singleton? = null

        fun getInstance(): Singleton =
            instance ?: synchronized(this) {
                instance ?: Singleton().also { instance = it }
            }
    }
}
// Или проще и безопаснее в Kotlin:
object SingletonKt { /* компилятор сам обеспечивает потокобезопасность */ }`
  },
  {
    id: "pat2", cat: "patterns", q: "Где в Android SDK встречаются классические паттерны Builder и Factory?",
    what: "Builder — пошаговое конструирование сложного объекта с множеством опциональных параметров. Factory — делегирование создания объекта отдельному методу/классу вместо прямого вызова конструктора.",
    key: "NotificationCompat.Builder — хрестоматийный Builder: у уведомления десятки опциональных полей (иконка, звук, действия), и через цепочку .setXxx() их удобно задавать выборочно вместо конструктора с 20 параметрами. ViewModelProvider.Factory — Factory: ViewModel часто нужно создавать с параметрами, которые Android-система не может передать сама при пересоздании экрана, поэтому создание делегируется фабрике.",
    example: "На вопрос 'какие паттерны ты использовал недавно' почти всегда можно сослаться на ViewModelProvider.Factory или Retrofit.Builder — это не 'притянутый' пример, а реально используемый почти в каждом проекте код.",
    code: `val notification = NotificationCompat.Builder(context, channelId)
    .setSmallIcon(R.drawable.ic_notification)
    .setContentTitle("Заголовок")
    .setContentText("Текст")
    .build()`
  },
  {
    id: "pat3", cat: "patterns", q: "Что такое God Object и почему Context в Android — хрестоматийный пример?",
    what: "God Object (антипаттерн) — класс, который берёт на себя слишком много ответственности и становится центральной точкой связанности всей системы.",
    key: "Context отвечает одновременно за: доступ к ресурсам (strings, drawables), запуск компонентов (startActivity), доступ к системным сервисам (getSystemService), доступ к файловой системе, темы и стили — это прямое нарушение принципа единственной ответственности (Single Responsibility, S из SOLID). На интервью это частый вопрос 'на засыпку': назвать явное нарушение SRP в самом Android SDK.",
    example: "Практическое следствие: именно поэтому Context не должен 'протекать' в Domain-слой Clean Architecture — это тянет за собой десяток скрытых ответственностей и рушит тестируемость бизнес-логики.",
    code: null
  },

  // ---------------- АРХИТЕКТУРНЫЕ ПАТТЕРНЫ (доп.) ----------------
  {
    id: "ar3", cat: "arch", q: "Зачем вообще нужен UseCase, если можно вызывать репозиторий прямо из ViewModel?",
    what: "UseCase (он же Interactor) — класс, инкапсулирующий один конкретный сценарий бизнес-логики (например, 'получить погоду и сохранить в избранное').",
    key: "Прямой вызов репозитория из ViewModel работает для тривиальных случаев (просто отдать данные), но UseCase становится незаменим, когда бизнес-логика требует координации НЕСКОЛЬКИХ репозиториев или содержит правила, не относящиеся ни к одному конкретному источнику данных (например, 'если кэш старше часа — обновить, иначе отдать локальные данные'). Без UseCase эта логика либо дублируется по разным ViewModel, либо утекает в репозиторий, размывая его ответственность.",
    example: "Хороший тест на необходимость UseCase: если сценарий использует больше одного репозитория, или его логику нужно переиспользовать на 2+ экранах — заводи UseCase. Если это тривиальный прямой проброс одного метода — UseCase действительно будет лишним 'перекладчиком', как и подмечали интервьюеры на некоторых собесах.",
    code: `class GetWeatherWithFavoriteStatusUseCase(
    private val weatherRepo: WeatherRepository,
    private val favoritesRepo: FavoritesRepository // координация двух источников
) {
    suspend operator fun invoke(city: String): WeatherUi {
        val weather = weatherRepo.getWeather(city)
        val isFavorite = favoritesRepo.isFavorite(city)
        return weather.toUi(isFavorite)
    }
}`
  },

  // ---------------- ЧИСТЫЙ КОД ----------------
  {
    id: "clean1", cat: "cleancode", q: "Почему возврат MutableList наружу из класса считается плохой практикой?",
    what: "Инкапсуляция — сокрытие внутреннего состояния класса от внешнего изменения не через его же публичный API.",
    key: "Если публичный геттер отдаёт MutableList, любой внешний код может вызвать .add()/.clear() и незаметно изменить внутреннее состояние объекта в обход всей его логики (валидации, уведомлений об изменении и т.д.) — класс теряет контроль над собственными инвариантами. Решение: возвращать наружу иммутабельный List (сужение типа, не обязательно копирование), а мутировать список только внутренними методами класса.",
    example: "Второе следствие того же принципа — предпочитать val вместо var для полей: val не даёт переприсвоить саму ссылку на список целиком в обход контролируемых методов изменения.",
    code: `class Cart {
    private val _items = mutableListOf<Item>()
    val items: List<Item> get() = _items // наружу — только для чтения

    fun addItem(item: Item) { _items.add(item) } // изменение только через контролируемый метод
}`
  },
  {
    id: "clean2", cat: "cleancode", q: "DRY, KISS, YAGNI — в чём разница между этими принципами простыми словами?",
    what: "Три взаимодополняющих, но разных принципа простоты кода.",
    key: "DRY (Don't Repeat Yourself) — не дублировать одну и ту же логику в нескольких местах, а вынести в одно переиспользуемое место. KISS (Keep It Simple, Stupid) — предпочитать самое простое решение задачи из работающих, не усложнять ради 'красоты' архитектуры. YAGNI (You Aren't Gonna Need It) — не добавлять функциональность 'про запас, вдруг понадобится в будущем', если она не нужна прямо сейчас — это неоправданно усложняет код и увеличивает площадь для багов.",
    example: "Частый разбираемый на собесах кейс с YAGNI — кандидат предлагает оставить избыточный метод 'на будущее', и интервьюер просит обосновать, почему это не создаёт лишнюю сложность прямо сейчас без реальной необходимости.",
    code: null
  },

  // ---------------- ALGORITHMS (доп.) ----------------
  {
    id: "al2", cat: "algo", q: "Как найти недостающее число в массиве за O(n), не используя сортировку?",
    what: "Задача: дан массив 1..N, из него убрали одно число, нужно найти какое, не прибегая к O(n log n) сортировке.",
    key: "Оптимальное решение — воспользоваться формулой суммы арифметической прогрессии: сумма чисел от 1 до N равна N*(N+1)/2. Считаем фактическую сумму элементов массива и вычитаем её из ожидаемой суммы — разница и есть недостающее число. Сложность O(n) по времени и O(1) по памяти, вместо O(n log n) у сортировки.",
    example: "Альтернатива при рисках переполнения (overflow) для очень больших N — использовать XOR всех чисел от 1 до N, XOR-нутый с XOR всех элементов массива (свойство XOR: a^a=0 сокращает совпадающие пары).",
    code: `fun findMissingNumber(nums: IntArray, n: Int): Int {
    val expectedSum = n * (n + 1) / 2
    val actualSum = nums.sum()
    return expectedSum - actualSum
}`
  },

  // ---------------- ROOM + SQL ----------------
  {
    id: "room1", cat: "room", q: "Как проводить миграции Room при изменении структуры таблиц?",
    what: "Миграция (Migration) — описание того, как преобразовать структуру базы данных со старой версии схемы на новую, не потеряв уже сохранённые пользовательские данные.",
    key: "Room привязан к номеру version в аннотации @Database. При любом изменении Entity (новое поле, новая таблица, изменение типа колонки) нужно повысить version и явно написать Migration с SQL-командами перехода (ALTER TABLE и т.д.) — иначе Room выбросит исключение при старте (или, при fallbackToDestructiveMigration(), просто удалит всю базу — приемлемо только для кэша, не для пользовательских данных).",
    example: "Частый вопрос 'на засыпку' — что будет, если забыть написать миграцию и не указать fallbackToDestructiveMigration(): приложение крашится при первом обращении к базе после обновления.",
    code: `val MIGRATION_1_2 = object : Migration(1, 2) {
    override fun migrate(db: SupportSQLiteDatabase) {
        db.execSQL("ALTER TABLE users ADD COLUMN email TEXT DEFAULT NULL")
    }
}

Room.databaseBuilder(context, AppDatabase::class.java, "app.db")
    .addMigrations(MIGRATION_1_2)
    .build()`
  },
  {
    id: "room2", cat: "room", q: "В чём разница между @Embedded, @Relation и TypeConverter в Room?",
    what: "Три разных механизма Room для работы со сложными/связанными данными (подробно связано с карточкой в Android SDK, но с фокусом именно на выбор инструмента).",
    key: "@Embedded — просто разворачивает поля 'своего' объекта в колонки той же таблицы, без создания связи между таблицами. @Relation — говорит Room собрать граф из ДВУХ РАЗНЫХ таблиц (реальная связь через внешний ключ), выполняя дополнительный запрос под капотом. TypeConverter — нужен, когда тип поля в принципе не поддерживается SQLite напрямую (например, LocalDateTime, List<String>, Uri) — конвертер учит Room превращать такой тип в примитив (обычно String/Long) для хранения и обратно при чтении.",
    example: "Практическое правило выбора: @Embedded — для 'своих' data-классов без отдельной таблицы. @Relation — когда данные реально хранятся в разных таблицах. TypeConverter — для сторонних типов, которые нельзя аннотировать напрямую.",
    code: `class Converters {
    @TypeConverter
    fun fromTimestamp(value: Long?): LocalDateTime? =
        value?.let { LocalDateTime.ofEpochSecond(it, 0, ZoneOffset.UTC) }

    @TypeConverter
    fun toTimestamp(date: LocalDateTime?): Long? = date?.toEpochSecond(ZoneOffset.UTC)
}`
  },

  // ---------------- RETROFIT + REST API ----------------
  {
    id: "retro1", cat: "retrofit", q: "Как добавить токен авторизации сразу ко всем сетевым запросам (например, если их уже 50+)?",
    what: "OkHttp Interceptor — компонент, который перехватывает каждый HTTP-запрос/ответ в цепочке OkHttp ДО того, как он реально уйдёт в сеть (или после того, как пришёл ответ), и может его модифицировать.",
    key: "Вместо того чтобы руками добавлять заголовок Authorization в каждый из 50+ методов Retrofit-интерфейса, пишется один AuthInterceptor, который добавляется в OkHttpClient — и применяется автоматически ко ВСЕМ запросам, проходящим через этот клиент, без изменения кода самих API-методов.",
    example: "Это прямое применение принципа DRY — общая для всех запросов логика (заголовок токена) написана один раз в одном месте, а не дублируется по каждому эндпоинту.",
    code: `class AuthInterceptor(private val tokenProvider: () -> String) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request().newBuilder()
            .addHeader("Authorization", "Bearer \${tokenProvider()}")
            .build()
        return chain.proceed(request)
    }
}

val client = OkHttpClient.Builder()
    .addInterceptor(AuthInterceptor { tokenStorage.getToken() })
    .build()`
  },
  {
    id: "retro2", cat: "retrofit", q: "Как правильно описать метод Retrofit-интерфейса с корутинами?",
    what: "Retrofit-интерфейс описывает эндпоинты декларативно через аннотации (@GET, @POST, @Path, @Query, @Body), а Retrofit генерирует реализацию под капотом.",
    key: "С корутинами метод объявляется как suspend fun и возвращает напрямую доменный/DTO-тип (не Call<T>) — Retrofit сам оборачивает вызов в корутино-совместимый adapter. Ошибки сети (таймаут, отсутствие интернета) выбрасываются как обычные исключения и ловятся через try/catch вокруг suspend-вызова, а не через отдельный callback, как было в старом Call-based подходе.",
    example: "Если нужен доступ к метаданным ответа (заголовки, HTTP-код), возвращают Response<T> вместо голого T — тогда суспенд-функция не бросает исключение на HTTP-ошибках 4xx/5xx, а явно возвращает их в response.code().",
    code: `interface WeatherApi {
    @GET("weather/{city}")
    suspend fun getWeather(@Path("city") city: String): WeatherDto

    @GET("weather/{city}")
    suspend fun getWeatherWithMeta(@Path("city") city: String): Response<WeatherDto>
}`
  },

  // ---------------- GIT ----------------
  {
    id: "git1", cat: "git", q: "merge vs rebase — в чём разница и когда что использовать?",
    what: "Обе команды применяются, чтобы 'подтянуть' изменения из одной ветки в другую, но по-разному переписывают историю коммитов.",
    key: "merge создаёт новый 'коммит слияния' (merge commit) с двумя родителями, сохраняя реальную историю разработки как она была (включая параллельные ветки) — безопаснее для командной работы, но история выглядит более 'запутанной'. rebase переносит коммиты твоей ветки поверх нового базового коммита, переписывая их хэши — история становится линейной и чище, но НЕЛЬЗЯ делать rebase уже запушенных публичных веток, которые кто-то ещё использует, — переписанная история сломает синхронизацию у коллег.",
    example: "Практическое правило: rebase — для своей локальной feature-ветки перед созданием Pull Request (чтобы история была чистой); merge — для интеграции в общие ветки (develop, main), которые уже расшарены с командой.",
    code: `# Обновить свою ветку изменениями из develop, сохранив линейную историю
git checkout feature/my-branch
git rebase develop

# Влить готовую фичу в develop с сохранением merge-коммита
git checkout develop
git merge feature/my-branch`
  },
  {
    id: "git2", cat: "git", q: "Что такое Gitflow и чем он отличается от Trunk-Based Development?",
    what: "Оба — модели ветвления (branching strategy), описывающие, как команда организует параллельную разработку в Git.",
    key: "Gitflow — долгоживущие ветки main (только релизы) и develop (текущая разработка) + отдельные feature/release/hotfix-ветки, которые в итоге вливаются в develop и main. Подходит большим командам с редкими релизами. Trunk-Based Development — почти все изменения идут напрямую (короткоживущими ветками) в единственную основную ветку (trunk/main), а незавершённые фичи скрываются за feature-тоглами (feature flags), а не долгоживущими ветками. Подходит командам с частыми релизами и CI/CD.",
    example: "В разобранных транскриптах интервью банки с редкими релизами (раз в месяц) чаще держатся за Gitflow, а команды с частыми деплоями (несколько раз в неделю) — за Trunk-Based + feature-тоглы.",
    code: null
  },

  // ---------------- TESTING (доп.) ----------------
  {
    id: "t4", cat: "testing", q: "Mock vs Fake — в чём разница в тестах?",
    what: "Оба — способы подменить реальную зависимость в тесте, чтобы изолировать тестируемый класс от её реального поведения.",
    key: "Mock (через библиотеку типа Mockito) — 'пустышка', которая ничего не делает сама по себе, пока ты явно не настроишь через whenever/verify, что она должна вернуть на конкретный вызов; хорош для проверки факта вызова метода. Fake — реальная, но упрощённая рабочая реализация интерфейса (например, WeatherRepository, хранящий данные в обычном HashMap в памяти вместо реальной сети/БД); ведёт себя как настоящая логика, просто без внешних зависимостей.",
    example: "Fake обычно предпочтительнее для тестирования сложного поведения (несколько последовательных вызовов с разным состоянием), а Mock — для простой проверки 'этот метод точно был вызван ровно один раз с такими параметрами'.",
    code: `// Fake — реальная упрощённая логика
class FakeWeatherRepository : WeatherRepository {
    private val storage = mutableMapOf<String, Weather>()
    override suspend fun getWeather(city: String) =
        storage[city] ?: throw NoSuchElementException()
    fun addWeather(city: String, weather: Weather) { storage[city] = weather }
}

// Mock — пустышка с настроенным поведением на конкретный вызов
val mockRepo = mock<WeatherRepository>()
whenever(mockRepo.getWeather("Rostov")).thenReturn(fakeWeather)`
  },

  // ---------------- KOTLIN (доп.) ----------------
  {
    id: "k4", cat: "kotlin", q: "Как работают SAM-conversions?",
    what: "SAM (Single Abstract Method) conversion — механизм, позволяющий передавать лямбду напрямую вместо интерфейса с ОДНИМ абстрактным методом, без явного создания анонимной реализации этого интерфейса.",
    key: "Компилятор сам оборачивает лямбду в подходящую реализацию интерфейса. Это критично для Java-интероперабельности: многие Android/Java API (например, `View.OnClickListener`, `Runnable`) — это функциональные Java-интерфейсы с одним методом, и Kotlin позволяет передать в них лямбду напрямую вместо `object : OnClickListener { override fun onClick(v: View) {...} }`.",
    example: "Для собственных Kotlin-интерфейсов SAM-conversion работает только если явно пометить интерфейс как `fun interface` (начиная с Kotlin 1.4) — без этой пометки лямбду напрямую передать не получится.",
    code: `// Java-интерфейс OnClickListener имеет один метод — SAM-conversion работает из коробки
button.setOnClickListener { view -> /* ... */ }

// Свой функциональный интерфейс — нужно fun interface
fun interface Validator { fun validate(input: String): Boolean }
val validator = Validator { it.isNotEmpty() } // тоже SAM-conversion`
  },

  // ---------------- COROUTINES (доп.) ----------------
  {
    id: "c5", cat: "coroutines", q: "Что такое Channel и Actor в корутинах, и когда нужен кастомный Dispatcher?",
    what: "Channel — примитив для передачи потока значений МЕЖДУ разными корутинами (аналог очереди, но suspend-совместимый — send/receive приостанавливают корутину вместо блокировки потока). Actor — паттерн поверх Channel: корутина с собственным приватным состоянием, к которому обращаются только через сообщения в канал, что исключает гонки данных без явных локов.",
    key: "Кастомный диспетчер создаётся оборачиванием обычного `java.util.concurrent.Executor` через `.asCoroutineDispatcher()` — нужен, когда требуется гарантированно последовательное выполнение на одном выделенном потоке (например, все операции с платежами должны идти строго по очереди, а не на общем пуле Dispatchers.IO).",
    example: "Actor — по сути официальная альтернатива synchronized/Mutex для защиты изменяемого состояния: вместо блокировки все изменения идут последовательно через единственный поток, читающий сообщения из канала.",
    code: `val paymentDispatcher = Executors.newSingleThreadExecutor().asCoroutineDispatcher()

val counterActor = CoroutineScope(Dispatchers.Default).actor<Int> {
    var counter = 0
    for (delta in channel) { counter += delta } // строго последовательно, без гонок
}`
  },

  // ---------------- FLOW (доп.) ----------------
  {
    id: "fl3", cat: "flow", q: "Что такое Backpressure и как его решать в Flow (buffer, conflate, collectLatest)?",
    what: "Backpressure — ситуация, когда источник данных (emitter) генерирует значения быстрее, чем подписчик (collector) успевает их обработать.",
    key: "buffer() — копит 'лишние' значения в очереди, чтобы emitter не ждал collector (полезно, если важно не потерять ни одного значения). conflate() — если collector не успевает, пропускает промежуточные значения и оставляет только последнее (полезно для быстро меняющихся данных типа позиции скролла). collectLatest() — при поступлении нового значения ОТМЕНЯЕТ ещё не завершённую обработку предыдущего и начинает обработку нового.",
    example: "conflate — для UI-состояния, где важен только актуальный снимок (progress bar). collectLatest — для поиска-по-мере-набора-текста (debounce-подобное поведение, где предыдущий 'ещё не завершённый' сетевой запрос нужно отменить при новом вводе).",
    code: `searchQueryFlow
    .collectLatest { query -> // отменит предыдущий поиск, если пришёл новый query
        val results = searchApi.search(query)
        updateUi(results)
    }`
  },

  // ---------------- ANDROID SDK (доп. 2) ----------------
  {
    id: "a7", cat: "android", q: "Deep Link vs App Link vs Deferred Deep Link — в чём разница?",
    what: "Все три механизма открывают конкретный экран приложения по ссылке, но отличаются уровнем доверия системы и поведением при отсутствии приложения.",
    key: "Deep Link — обычная кастомная схема (myapp://profile/42) через intent-filter; система не проверяет, что ссылка действительно принадлежит владельцу приложения, поэтому её может 'перехватить' любое другое приложение с таким же intent-filter. App Link — верифицированный Android системой https-адрес (через Digital Asset Links файл на сервере), который гарантированно откроет именно твоё приложение, если оно установлено, минуя диалог выбора приложения. Deferred Deep Link — ссылка, которая срабатывает ПОСЛЕ установки приложения из стора (человек кликнул по ссылке, у него не было приложения, установил его — и после первого запуска приложение всё равно 'помнит', на какой экран его вели).",
    example: "Deferred Deep Link обычно реализуют через сторонние SDK (Firebase Dynamic Links и аналоги), которые прокидывают параметр перехода через referrer установки из Google Play.",
    code: null
  },
  {
    id: "a8", cat: "android", q: "Что происходит в системе, когда пользователь кликает на иконку приложения (запуск от Zygote до onCreate)?",
    what: "Запуск приложения — это не 'создание процесса с нуля', а форк (fork) уже существующего специального процесса-шаблона Zygote, который Android держит постоянно запущенным именно для быстрого старта новых приложений.",
    key: "Порядок: 1) Launcher посылает системе Intent на запуск; 2) Activity Manager Service (AMS) просит Zygote сделать fork — это гораздо быстрее полной инициализации новой Dalvik/ART-виртуальной машины с нуля, так как Zygote уже 'прогрет' и содержит предзагруженные системные классы и ресурсы; 3) в новом форкнутом процессе создаётся объект Application и вызывается Application.onCreate(); 4) AMS запускает нужную Activity через её конструктор и жизненный цикл (onCreate → onStart → onResume).",
    example: "Именно поэтому тяжёлая логика в Application.onCreate() (инициализация тяжёлых SDK) напрямую увеличивает время холодного старта приложения — это самый первый код, который реально выполняется в новом процессе.",
    code: null
  },
  {
    id: "a9", cat: "android", q: "Чем отличаются Build Type, Product Flavor и Build Variant?",
    what: "Три связанных, но разных понятия системы сборки Gradle для Android.",
    key: "Build Type — техническая конфигурация сборки (debug/release: включён ли ProGuard, подпись, debuggable). Product Flavor — бизнес-вариант приложения с разным контентом/поведением при том же коде (например, 'free' и 'paid' версии, или разные бренды из одной кодовой базы). Build Variant — конкретная комбинация Flavor × Build Type, которая реально собирается (например, freeDebug, paidRelease) — именно её видно в выпадающем списке Build Variants в Android Studio.",
    example: "Flavor Dimensions нужны, когда у тебя два независимых измерения флейворов одновременно (например, 'free/paid' И 'brandA/brandB') — тогда Gradle комбинирует их по осям, а не просто списком.",
    code: null
  },

  // ---------------- ВЬЮ XML (доп.) ----------------
  {
    id: "vx4", cat: "viewxml", q: "Как touch-событие доходит до нужной View (dispatchTouchEvent vs onInterceptTouchEvent)?",
    what: "Touch-событие (MotionEvent) проходит по иерархии View сверху вниз (от родителя к самому глубокому дочернему элементу под пальцем), и на каждом уровне у ViewGroup есть шанс либо пропустить событие дальше, либо перехватить его себе.",
    key: "dispatchTouchEvent() — точка входа события в View/ViewGroup, решает, кому передать обработку. onInterceptTouchEvent() — есть только у ViewGroup, вызывается перед тем, как событие уйдёт к дочерним элементам; если вернуть true, ViewGroup 'забирает' событие себе, и дочерние View его больше не получат. onTouchEvent() — финальная обработка события конкретной View.",
    example: "Классический пример использования onInterceptTouchEvent() — SwipeRefreshLayout или ViewPager: родитель должен 'перехватить' горизонтальный свайп для смены страницы, даже если внутри находится кликабельная кнопка.",
    code: null
  },

  // ---------------- DAGGER (доп. 2) ----------------
  {
    id: "d5", cat: "di", q: "Что такое Composition Root и Dependency Graph?",
    what: "Composition Root — единственное место в приложении, где происходит реальная 'сборка' (wiring) всех зависимостей друг с другом — то есть где решается, какая конкретная реализация подставляется под каждый интерфейс.",
    key: "Dependency Graph — это визуальное/концептуальное представление всех связей между зависимостями (кто от кого зависит) во всём приложении; Dagger буквально генерирует этот граф на этапе компиляции и падает с ошибкой компиляции, если граф не может быть построен (например, забыли забиндить интерфейс). Composition Root не должен быть размазан по всему коду — если конкретные реализации 'протекают' в бизнес-логику, это нарушает Dependency Inversion.",
    example: "В приложении с Dagger/Hilt Composition Root — это фактически совокупность всех @Module-классов; в Manual DI (без библиотек) — это обычно единственный класс-контейнер, который создаётся в Application.onCreate().",
    code: null
  },

  // ---------------- АРХИТЕКТУРНЫЕ ПАТТЕРНЫ (доп. 2) ----------------
  {
    id: "ar4", cat: "arch", q: "UI State vs UI Event — почему нельзя хранить навигацию как обычное состояние?",
    what: "UI State — то, что описывает ТЕКУЩУЮ длительную ситуацию на экране (загрузка идёт / данные показаны / ошибка) и должно быть доступно в любой момент, даже после пересоздания экрана. UI Event — разовое действие (показать Toast, перейти на другой экран), которое должно произойти РОВНО один раз.",
    key: "Если хранить событие навигации в State (например, StateFlow), при пересоздании подписчика (поворот экрана) StateFlow отдаст своё последнее значение заново — и навигация случайно сработает повторно. Единый источник истины (Single Source of Truth) для состояния не означает, что разовые события нужно хранить тем же способом — для них нужен отдельный механизм с семантикой 'потребили один раз и забыли' (SharedFlow с replay=0, или Channel).",
    example: "Признак бага 'навигация происходит повторно при повороте экрана' почти всегда означает, что событие навигации ошибочно хранится как персистентное состояние вместо одноразового события.",
    code: null
  },
  {
    id: "ar5", cat: "arch", q: "DTO vs Domain Model — зачем нужны два разных объекта для одних и тех же данных?",
    what: "DTO (Data Transfer Object) — 'грязный' объект, повторяющий структуру ответа сервера (JSON) один в один, со всеми его особенностями (nullable-поля 'на всякий случай', странный нейминг бэкенда, версионные костыли API). Domain Model — 'чистый' объект, удобный для бизнес-логики приложения, не привязанный к конкретному формату конкретного API.",
    key: "Без разделения любое изменение контракта бэкенда (переименовали поле, поменяли формат даты) вынуждает переписывать код по всему приложению, включая UI. С разделением меняется только маппер (DTO → Domain) в одном месте, а вся остальная кодовая база продолжает работать с неизменной доменной моделью. Это прямое применение Single Responsibility — DTO отвечает за сериализацию, Domain Model — за бизнес-смысл.",
    example: "Если в UI/ViewModel напрямую используется класс с суффиксом `Dto` или `Response` — это тревожный звоночек: слой представления должен знать только о Domain-модели.",
    code: `data class UserDto(val usr_nm: String?, val brth_dt: String?) // прямая копия ответа сервера
data class User(val name: String, val birthDate: LocalDate)      // чистая доменная модель

fun UserDto.toDomain(): User = User(
    name = usr_nm.orEmpty(),
    birthDate = LocalDate.parse(brth_dt ?: "1970-01-01")
)`
  },

  // ---------------- JAVA (доп.) ----------------
  {
    id: "j4", cat: "java", q: "Когда использовать SparseArray/ArrayMap вместо HashMap на Android?",
    what: "SparseArray и ArrayMap — оптимизированные Android-специфичные коллекции, предложенные как более экономная по памяти замена HashMap для определённых сценариев.",
    key: "HashMap для каждой пары ключ-значение создаёт отдельный объект-обёртку (Entry) плюс тратит память на массив bucket'ов, что при малом количестве элементов — избыточные накладные расходы. SparseArray/ArrayMap хранят данные в простых параллельных массивах и используют бинарный поиск вместо хэширования — экономят память, но проигрывают в скорости на больших объёмах (O(log n) вместо O(1) у HashMap). Правило: для малых коллекций (обычно < 1000 элементов) на мобильном устройстве экономия памяти важнее — используй ArrayMap/SparseArray; для больших коллекций или частых операций — HashMap.",
    example: "SparseArray дополнительно избегает автобоксинга Integer-ключей (принимает примитивный int напрямую) — ещё один источник экономии памяти по сравнению с HashMap<Integer, V>.",
    code: null
  },

  // ---------------- JAVA (доп. 2) ----------------
  {
    id: "j5", cat: "java", q: "Что такое WeakHashMap и когда его применять?",
    what: "WeakHashMap — реализация Map, которая хранит КЛЮЧИ через слабые ссылки¹ (WeakReference) вместо обычных (Strong) ссылок.",
    key: "Если на ключ больше нигде в программе нет обычной ссылки — сборщик мусора вправе удалить объект-ключ, и запись автоматически исчезнет из WeakHashMap сама, без ручного вызова remove(). Обычный HashMap так не умеет: пока запись лежит в мапе, она держит ключ живым независимо от того, нужен ли он где-то ещё в программе.",
    example: "Практический кейс — кэш 'привязанный к жизни объекта': например, храним доп. метаданные для View, пока эта View жива; как только View уничтожается и больше ниоткуда не используется, запись в WeakHashMap исчезает сама, без утечки памяти.",
    code: `val metadataCache = WeakHashMap<View, ViewMetadata>()
metadataCache[someView] = ViewMetadata(...)
// Когда someView больше нигде не используется — GC соберёт её,
// и запись в metadataCache исчезнет сама собой`
  },
  {
    id: "j6", cat: "java", q: "Что такое ThreadLocal и зачем он нужен?",
    what: "ThreadLocal — механизм, позволяющий каждому потоку иметь СВОЮ собственную независимую копию переменной, даже если все потоки обращаются к одному и тому же объекту ThreadLocal.",
    key: "Это способ избежать синхронизации в принципе, а не бороться с гонкой данных через locks — если у каждого потока своя копия, гонки просто не может возникнуть, потому что потоки не делят одно и то же значение.",
    example: "Классический пример — SimpleDateFormat в старом Java не потокобезопасен (мутирует внутреннее состояние при parse/format), но через ThreadLocal каждый поток получает свой экземпляр форматтера без блокировок.",
    code: `val threadLocalId = ThreadLocal.withInitial { Thread.currentThread().id }
// Каждый поток при обращении к threadLocalId.get() получит СВОЁ значение`
  },
  {
    id: "j7", cat: "java", q: "ReentrantLock, CountDownLatch, CyclicBarrier — чем отличаются друг от друга?",
    what: "Три разных примитива синхронизации из пакета java.util.concurrent для разных сценариев координации потоков.",
    key: "ReentrantLock — более гибкая альтернатива synchronized: можно попытаться захватить лок с таймаутом (tryLock), можно прервать ожидание, поддерживает несколько условий ожидания (Condition). CountDownLatch — 'счётчик обратного отсчёта', одноразовый: один или несколько потоков ждут, пока другие N потоков не вызовут countDown() ровно N раз (например, главный поток ждёт, пока 3 параллельные загрузки не завершатся). CyclicBarrier — похож на CountDownLatch, но многоразовый: группа потоков взаимно ждёт друг друга в определённой точке и потом все вместе продолжают выполнение (например, несколько потоков параллельно считают часть большой задачи и должны 'сойтись' перед следующим этапом).",
    example: "Ключевое отличие CountDownLatch от CyclicBarrier: CountDownLatch используется один раз и не может быть 'сброшен', CyclicBarrier можно переиспользовать многократно для повторяющихся фаз вычислений.",
    code: `val latch = CountDownLatch(3)
repeat(3) {
    thread { loadPart(it); latch.countDown() }
}
latch.await() // главный поток дождётся всех трёх countDown()`
  },
  {
    id: "j8", cat: "java", q: "Что такое Happens-Before в Java Memory Model?",
    what: "Happens-Before — формальное правило Java Memory Model (JMM), гарантирующее, что если операция A 'happens-before' операции B, то результат A гарантированно виден потоку, выполняющему B.",
    key: "Без такой гарантии компилятор/процессор вправе переупорядочивать инструкции и кэшировать значения в регистрах, и другой поток может увидеть 'устаревшее' значение переменной. synchronized, volatile и запуск/присоединение потока (Thread.start()/join()) — все создают отношение happens-before между операциями до и после них.",
    example: "Именно happens-before объясняет, ПОЧЕМУ volatile вообще работает: запись в volatile-переменную happens-before любого последующего чтения этой же переменной другим потоком — то есть JMM формально гарантирует видимость, а не просто 'на практике так получается'.",
    code: null
  },

  // ---------------- COMPOSE (доп.) ----------------
  {
    id: "cx4", cat: "compose", q: "Что такое State Hoisting (подъём состояния) в Compose?",
    what: "State Hoisting — паттерн, при котором Composable-функция НЕ хранит состояние сама внутри себя, а принимает текущее значение и колбэк для его изменения через параметры — то есть состояние 'поднимается' на уровень выше, к вызывающему коду.",
    key: "Это прямое применение принципа единственной ответственности (SRP) — Composable отвечает только за отображение и передачу событий наверх, а решение 'как именно меняется состояние' остаётся у вызывающего кода (обычно ViewModel). Побочный эффект — компонент становится stateless и намного проще переиспользуется и тестируется: чтобы протестировать его, не нужен реальный источник состояния, достаточно передать любое значение и заглушку-колбэк.",
    example: "Признак того, что стоит поднять состояние — если один и тот же Composable в разных местах экрана нужно использовать с разными данными, но сам компонент 'жёстко' хранит своё mutableStateOf внутри.",
    code: `// Без hoisting — компонент 'владеет' своим состоянием, его сложно переиспользовать
@Composable
fun SearchFieldBad() {
    var text by remember { mutableStateOf("") }
    TextField(value = text, onValueChange = { text = it })
}

// С hoisting — состояние поднято наверх, компонент просто отображает и сообщает о событиях
@Composable
fun SearchField(text: String, onTextChange: (String) -> Unit) {
    TextField(value = text, onValueChange = onTextChange)
}`
  },
  {
    id: "cx5", cat: "compose", q: "produceState и rememberUpdatedState — для чего нужны?",
    what: "produceState — способ создать Compose State, значение которого асинхронно обновляется корутиной, инкапсулируя логику загрузки прямо внутри самого состояния. rememberUpdatedState — 'запоминает' самое последнее значение переданного параметра/колбэка, даже если долгоживущий эффект (например, LaunchedEffect с ключом Unit) уже был запущен со старым значением.",
    key: "Проблема, которую решает rememberUpdatedState: если LaunchedEffect(Unit) запущен один раз и не перезапускается, а внутри него используется колбэк, полученный параметром — без rememberUpdatedState эффект будет держать ссылку на СТАРУЮ версию колбэка из первой композиции, даже если снаружи передали новый.",
    example: "produceState удобен, когда нужно превратить внешний асинхронный источник (например, Flow из другой библиотеки, не имеющей встроенной Compose-интеграции) в обычный Compose State одним вызовом, не создавая отдельный ViewModel.",
    code: `@Composable
fun rememberElapsedTime(onTimeout: () -> Unit): State<Int> {
    val currentOnTimeout by rememberUpdatedState(onTimeout) // всегда актуальный колбэк
    return produceState(initialValue = 0) {
        while (true) {
            delay(1000)
            value += 1
            if (value >= 60) { currentOnTimeout(); break }
        }
    }
}`
  },

  // ---------------- ЧИСТЫЙ КОД (доп.) ----------------
  {
    id: "clean3", cat: "cleancode", q: "Покажи все 5 принципов SOLID на одном сквозном Kotlin-примере",
    what: "SOLID — пять принципов объектно-ориентированного дизайна (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion), которые вместе делают код легче расширять и тестировать без переписывания существующих классов.",
    key: "S — каждый класс отвечает ровно за одну вещь (EmailValidator валидирует, не отправляет письма). O — новый способ оплаты добавляется НОВЫМ классом, а не правкой существующего if/when. L — любая реализация PaymentMethod должна вести себя предсказуемо, не бросая неожиданных исключений там, где базовый тип этого не делает. I — узкие интерфейсы (Payable) вместо одного 'толстого' с лишними методами. D — PaymentProcessor зависит от интерфейса PaymentMethod, а не от конкретных классов CardPayment/CashPayment.",
    example: "На собесе часто просят не просто перечислить буквы, а показать, как ИМЕННО текущий класс нарушает принцип и как это исправить — формула 'что это → как нарушается → как исправить' работает и здесь.",
    code: `// D: зависимость от абстракции, не от реализации
interface PaymentMethod { fun pay(amount: Int): Boolean }

// O: новый способ оплаты — новый класс, старый код не трогаем
class CardPayment : PaymentMethod {
    override fun pay(amount: Int): Boolean = true // логика оплаты картой
}
class CashPayment : PaymentMethod {
    override fun pay(amount: Int): Boolean = true // логика оплаты наличными
}

// S: единственная ответственность — только оркестрация оплаты
class PaymentProcessor(private val method: PaymentMethod) {
    fun process(amount: Int) = method.pay(amount)
}
// I: интерфейс узкий, не тянет лишние методы вроде refund() туда, где это не нужно`
  },

  // ---------------- COLLECTIONS / DATA STRUCTURES (Java, доп.) ----------------
  {
    id: "j9", cat: "java", q: "Как HashSet устроен внутри и почему TreeMap хранит элементы отсортированными?",
    what: "HashSet — на самом деле обёртка НАД HashMap: каждый элемент множества хранится как ключ в скрытой внутренней HashMap, а в качестве значения используется один общий служебный объект-заглушка. TreeMap — реализация Map на основе самобалансирующегося красно-чёрного дерева, поэтому обход элементов всегда идёт в отсортированном по ключу порядке.",
    key: "Именно поэтому в HashSet нельзя хранить два 'равных по equals' элемента: попытка добавить второй такой же — это попытка вставить в HashMap запись с уже существующим ключом, которая просто не создаёт новую запись (в отличие от HashMap.put(), где значение бы перезаписалось — в HashSet 'перезаписывать' нечего, ключ и есть весь смысл). TreeMap платит за сортировку логарифмической сложностью операций (O(log n)) вместо amortized O(1) у HashMap.",
    example: "Если на собесе спросят 'как бы ты реализовал Set, если бы его не было в языке' — правильный ответ буквально описывает то, как Java это уже сделала: через Map с фиктивным значением.",
    code: null
  },

  // ---------------- SYSTEM DESIGN ----------------
  {
    id: "sd1", cat: "sysdesign", q: "Как вообще начать System Design интервью и не утонуть в деталях",
    what: "System Design интервью для мобильного разработчика — это не про то, чтобы сразу выдать готовую архитектуру, а про то, чтобы показать структурированный ход мысли: как ты сужаешь неопределённую задачу до конкретного плана.",
    key: "Рабочая структура на 45–60 минут: 1) 2–5 мин знакомство (коротко, без лишнего); 2) 5 мин — сузить масштаб задачи (только клиент с готовым API? клиент + придумать API? реже — ещё и бэкенд); 3) 10–15 мин — сбор требований и высокоуровневая схема; 4) 20–30 мин — детальный разбор одного конкретного компонента по выбору интервьюера; 5) 5 мин — твои вопросы. Первый практический шаг — явно спросить интервьюера, какого масштаба задача, а не додумывать самому.",
    example: "Хороший сигнал для интервьюера — вслух проговаривать предположения ('я предполагаю, что авторизация уже реализована, правильно?') вместо молчаливых догадок — это и есть то самое 'озвучивай мысли', о котором тебе уже говорили на реальных мок-собесах.",
    code: null
  },
  {
    id: "sd2", cat: "sysdesign", q: "Как разделить требования на функциональные, нефункциональные и 'вне рамок'",
    what: "Три категории, которые обязательно нужно явно проговорить перед проектированием, чтобы не спроектировать что-то, чего от тебя не просили (или наоборот — забыть важное).",
    key: "Функциональные требования — что пользователь может СДЕЛАТЬ (обычно 3–5 самых ценных для бизнеса действий, например 'бесконечная лента', 'лайк', 'открыть детали'). Нефункциональные — как система должна себя вести НЕЗАВИСИМО от конкретной функции (оффлайн-режим, real-time обновления, экономия батареи/трафика). 'Вне рамок' — то, что явно исключается из обсуждения (авторизация, аналитика, навигация), чтобы не тратить время впустую, но при этом показать, что ты в курсе об их существовании.",
    example: "Пропуск этого шага — частая ошибка кандидатов: без явного разделения интервьюер не понимает, специально ли ты не упомянул авторизацию, или просто забыл о ней.",
    code: null
  },
  {
    id: "sd3", cat: "sysdesign", q: "Анатомия фича-модульной архитектуры — что входит в Feature API, а что в Impl",
    what: "Стандартная схема разбиения приложения на независимые фичи-модули для командной разработки.",
    key: "Feature API — публичный контракт фичи (интерфейсы UseCase, роутер для перехода на экран этой фичи) БЕЗ привязки к конкретному фреймворку или платформе — это тот самый Dependency Inversion (D из SOLID¹): другие модули зависят от абстракции, а не от реализации. Feature Impl — конкретная реализация (Compose/XML экраны, ViewModel, работа с сетью) — подключается только в App-модуле, а не напрямую в других фичах, иначе получаются циклические зависимости между фичами и ломается независимая сборка.",
    example: "Core-модули (навигация, авторизация, аналитика) — отдельная категория: они не разделяются на api/impl, потому что должны быть доступны всем фичам напрямую как готовый сервис.",
    code: null
  },
  {
    id: "sd4", cat: "sysdesign", q: "Offset vs Keyset vs Cursor пагинация — что выбрать для ленты",
    what: "Три способа реализовать постраничную загрузку списка данных с сервера, отличающихся тем, как клиент 'помнит', на чём остановился.",
    key: "Offset (limit+offset) — проще всего реализовать, но плохо себя ведёт на больших списках: если между запросами добавились новые элементы, сдвигаются позиции старых (page drifting¹ — элементы дублируются или пропускаются). Keyset — использует значение последней загруженной записи (например, дату) вместо номера страницы, работает быстрее на больших объёмах, но требует, чтобы поле сортировки было естественно упорядоченным (timestamp). Cursor — сервер сам кодирует непрозрачный идентификатор позиции (обычно через base64), полностью отвязывая клиента от деталей БД — самый устойчивый к параллельным изменениям вариант, но сложнее в реализации на бэкенде.",
    example: "Для бесконечной ленты (как в реальном System Design интервью про Twitter/Авито) курсорная пагинация — обычно правильный выбор, потому что лента постоянно меняется, а offset в таких условиях даёт дубли и пропуски.",
    code: null
  },
  {
    id: "sd5", cat: "sysdesign", q: "Push vs Polling vs SSE vs WebSocket — как выбрать способ real-time обновлений",
    what: "Разные механизмы доставки 'живых' обновлений с сервера на клиент, с разным балансом простоты, надёжности и накладных расходов.",
    key: "Push-уведомления — просты, встроены в платформу, но не гарантированы на 100% и могут прийти с задержкой. Long polling — клиент держит соединение открытым, пока сервер не ответит — мгновенно, но дорого по серверным ресурсам. SSE (Server-Sent Events) — однонаправленный поток событий поверх одного HTTP-соединения — хорош, когда обновления идут только от сервера к клиенту. WebSocket — полный дуплекс, нужен, когда клиент тоже должен часто отправлять данные (например, чат).",
    example: "Частое комбинированное решение на реальных собесах — SSE как основной канал 'живых' обновлений + Push как резервный вариант, если у клиента в моменте нет активного соединения.",
    code: null
  },
  {
    id: "sd6", cat: "sysdesign", q: "Как разрешать конфликты между локальным и серверным состоянием в offline-first приложении",
    what: "Проблема возникает, когда пользователь менял данные без интернета на нескольких устройствах, а потом оба устройства одновременно синхронизируются с сервером.",
    key: "Локальное разрешение — устройство после выхода в сеть само сливает своё состояние с серверным и отправляет итог; просто реализовать, но небезопасно (устройство получает слишком много доверия) и не решает проблему одновременной синхронизации с нескольких устройств. Удалённое разрешение — сервер сам решает конфликт по своей логике, а устройство просто перезаписывает локальное состояние присланным ответом; сложнее на бэкенде, зато не требует обновления клиента при изменении правил разрешения конфликтов.",
    example: "Для банковских/платёжных операций разрешение конфликтов почти всегда должно быть на сервере — доверять клиентскому устройству финальное решение о состоянии денег недопустимо по соображениям безопасности.",
    code: null
  },

  // ---------------- RXJAVA ----------------
  {
    id: "rx1", cat: "rxjava", q: "Какие бывают Subjects в RxJava и чем отличаются?",
    what: "Subject — одновременно и Observable, и Observer: можно и подписаться на него, и вручную эмитить в него значения — это делает его 'мостом' между обычным кодом и реактивным миром.",
    key: "PublishSubject — отдаёт подписчику только те значения, что были эмитированы ПОСЛЕ подписки (пропущенное до подписки — потеряно). BehaviorSubject — при подписке сразу отдаёт последнее эмитированное значение (или заданное начальное), а затем все последующие — прямой аналог StateFlow в мире корутин. ReplaySubject — запоминает и отдаёт новому подписчику ВСЮ (или ограниченную) историю значений. AsyncSubject — отдаёт только самое последнее значение, и только после явного вызова onComplete().",
    example: "BehaviorSubject — самый близкий аналог того, как ведёт себя StateFlow (всегда есть 'текущее' значение), а PublishSubject ближе к SharedFlow с replay=0.",
    code: null
  },
  {
    id: "rx2", cat: "rxjava", q: "Hot vs Cold Observable — и как превратить один в другой",
    what: "Cold Observable создаёт свой источник данных заново для КАЖДОГО нового подписчика (аналог обычного cold Flow). Hot Observable — один общий источник, существующий независимо от подписчиков, которые просто 'подключаются' к уже идущему потоку.",
    key: "Превратить cold в hot можно операторами publish() (превращает в ConnectableObservable) + connect() (запускает эмиссию вручную, в нужный момент, а не при первой подписке) — это позволяет нескольким подписчикам разделить один и тот же реальный сетевой запрос вместо того, чтобы каждый вызывал его заново. Обратное превращение (hot → cold) обычно делают через обёртку, которая при каждой новой подписке заново инициирует получение актуального 'снимка' состояния.",
    example: "Практический кейс: если 3 разных экрана подписываются на один и тот же сетевой Observable без publish()+connect(), сработает 3 РЕАЛЬНЫХ сетевых запроса вместо одного общего — частая причина лишнего сетевого трафика в legacy-коде на RxJava.",
    code: null
  },
  {
    id: "rx3", cat: "rxjava", q: "subscribeOn vs observeOn в RxJava — куда именно каждый влияет?",
    what: "Оба меняют поток выполнения, но воздействуют на разные участки цепочки операторов.",
    key: "subscribeOn задаёт поток, на котором стартует ИСТОЧНИК данных (сам код внутри Observable.create/fromCallable) — если вызвать subscribeOn несколько раз в одной цепочке, реально сработает только тот вызов, что стоит БЛИЖЕ к источнику (самый первый по цепочке снизу вверх). observeOn переключает поток для ВСЕХ операторов, идущих ПОСЛЕ него по цепочке — можно вызывать несколько раз, и каждый вызов реально меняет поток для последующего участка.",
    example: "Типичная связка: subscribeOn(Schedulers.io()) — чтобы сетевой запрос ушёл в фоновый поток, и observeOn(AndroidSchedulers.mainThread()) перед подпиской — чтобы результат обработался в UI-потоке.",
    code: `apiService.getUser(id)
    .subscribeOn(Schedulers.io())       // источник (сетевой запрос) — в IO-потоке
    .observeOn(AndroidSchedulers.mainThread()) // всё после этой точки — в Main
    .subscribe { user -> updateUi(user) }`
  },
  {
    id: "rx4", cat: "rxjava", q: "flatMap vs concatMap vs switchMap — в чём разница на практике?",
    what: "Все три превращают каждый элемент потока в новый Observable и как-то объединяют результаты, но по-разному управляют порядком и конкуренцией.",
    key: "flatMap — запускает все внутренние Observable ПАРАЛЛЕЛЬНО и мержит результаты по мере готовности, не гарантируя исходный порядок. concatMap — то же самое, но СТРОГО последовательно: ждёт завершения одного внутреннего Observable, прежде чем начать следующий — сохраняет порядок ценой скорости. switchMap — при появлении НОВОГО элемента из исходного потока отменяет ещё не завершившийся предыдущий внутренний Observable и переключается на новый.",
    example: "switchMap — классический выбор для поиска-по-мере-набора-текста (аналог collectLatest во Flow): новый ввод пользователя должен отменить ещё не пришедший ответ на предыдущий запрос, а не показать устаревший результат поверх нового.",
    code: null
  },
  {
    id: "rx5", cat: "rxjava", q: "Что такое Backpressure в RxJava и чем Flowable отличается от Observable?",
    what: "Backpressure — ситуация, когда источник эмитит элементы быстрее, чем подписчик успевает их обработать (тот же концепт, что мы разбирали для Flow, только в мире RxJava).",
    key: "Observable НЕ поддерживает backpressure вообще — если источник слишком быстрый, элементы просто накапливаются в памяти без ограничений, что может привести к OutOfMemoryError. Flowable — специально спроектирован для потенциально больших/быстрых потоков и поддерживает стратегии backpressure (BUFFER, DROP, LATEST, ERROR) — подписчик может явно сообщить источнику, сколько элементов готов принять за раз через request(n).",
    example: "Практическое правило: для UI-событий (клики, текстовый ввод) обычно достаточно Observable — там элементов немного. Flowable нужен, когда источник данных потенциально неограниченный и быстрый — например, чтение большого файла построчно или поток событий от сенсора.",
    code: null
  },

  {
    id: "k5", cat: "kotlin", q: "Чем fold отличается от reduce?",
    what: "Обе функции 'сворачивают' коллекцию в одно значение, последовательно применяя лямбду к накопителю и очередному элементу.",
    key: "reduce использует ПЕРВЫЙ элемент коллекции как начальное значение накопителя — поэтому падает с исключением на пустой коллекции. fold требует явно передать начальное значение накопителя (любого типа, не обязательно совпадающего с типом элементов) — поэтому безопасно работает даже на пустой коллекции, просто вернёт это начальное значение.",
    example: "fold удобен, когда тип результата отличается от типа элементов — например, посчитать сумму длин строк в список чисел через fold(0) { acc, str -> acc + str.length }, что через reduce сделать напрямую нельзя.",
    code: `val nums = listOf(1, 2, 3, 4)
val sum1 = nums.reduce { acc, n -> acc + n }       // 10, старт — первый элемент (1)
val sum2 = nums.fold(100) { acc, n -> acc + n }    // 110, старт — явно заданные 100

val empty = emptyList<Int>()
empty.fold(0) { acc, n -> acc + n } // 0, безопасно
// empty.reduce { acc, n -> acc + n } // упадёт с UnsupportedOperationException`
  },
  {
    id: "k6", cat: "kotlin", q: "Sealed class vs sealed interface — когда что выбрать?",
    what: "Оба ограничивают набор возможных наследников компилятором на этапе компиляции (все наследники должны быть известны заранее, обычно в том же модуле/пакете), что позволяет компилятору проверять исчерпанность when-выражения без ветки else.",
    key: "sealed class может хранить общее состояние и логику в базовом классе (общие поля/методы для всех наследников). sealed interface нужен, когда наследнику требуется реализовать НЕСКОЛЬКО источников поведения одновременно (в Kotlin нет множественного наследования классов, но есть множественная реализация интерфейсов) — например, состояние экрана одновременно должно быть и Loadable, и Cacheable.",
    example: "Правило выбора: если наследникам не нужно ничего наследовать, кроме этой иерархии — берём sealed class (проще). Если наследнику нужно ЕЩЁ и реализовать другой интерфейс — берём sealed interface, чтобы не упереться в ограничение одиночного наследования классов.",
    code: `sealed interface ScreenState
sealed interface Cacheable // отдельная независимая способность

data class Loading(val progress: Int) : ScreenState
data class Success(val data: String) : ScreenState, Cacheable // реализует оба сразу
data class Error(val message: String) : ScreenState`
  },
  {
    id: "k7", cat: "kotlin", q: "Что происходит 'под капотом' у object и companion object в байт-коде?",
    what: "object declaration компилируется в обычный final-класс с единственным статическим полем INSTANCE и приватным конструктором — JVM гарантирует, что этот класс проинициализируется ровно один раз, потокобезопасно, при первом обращении (ленивая инициализация обеспечивается самим механизмом загрузки классов JVM).",
    key: "companion object компилируется в отдельный вложенный класс с именем Companion внутри основного класса — то есть technically это НЕ статические члены самого класса, а поля экземпляра объекта Companion. Чтобы реально сгенерировать статический метод/поле для удобного вызова из Java, нужна аннотация @JvmStatic — без неё Java-код будет вынужден писать MyClass.Companion.method() вместо привычного MyClass.method().",
    example: "Именно поэтому companion object 'притворяется' статикой только в Kotlin-коде (компилятор Kotlin сам подставляет неявный доступ через Companion) — а для Java-интеропа нужна явная аннотация.",
    code: `class Config {
    companion object {
        @JvmStatic
        fun getDefault(): Config = Config() // без @JvmStatic из Java пришлось бы Config.Companion.getDefault()
    }
}`
  },
  {
    id: "k8", cat: "kotlin", q: "lateinit vs by lazy — детальное сравнение",
    what: "Оба откладывают инициализацию свойства, но решают разные задачи и работают по-разному механически.",
    key: "lateinit — для var (мутабельного, не-nullable, не-примитивного) свойства, инициализируемого КЕМ-ТО СНАРУЖИ позже (типичный кейс — поле, которое заполняет DI-фреймворк). by lazy — для val (иммутабельного) свойства, которое САМО вычисляет своё значение через переданную лямбду при ПЕРВОМ обращении, и дальше кэширует результат навсегда. lazy по умолчанию потокобезопасен (LazyThreadSafetyMode.SYNCHRONIZED) — можно ослабить до NONE, если точно знаешь, что доступ будет только из одного потока, ради производительности.",
    example: "Проверка инициализации lateinit-переменной: `if (::propertyName.isInitialized)` — специальный синтаксис через ссылку на свойство, который есть только у lateinit.",
    code: `lateinit var repository: WeatherRepository // заполнит Dagger/Hilt позже

val heavyParser: Parser by lazy { HeavyParser() } // вычислится один раз при первом обращении

if (::repository.isInitialized) { /* безопасно использовать */ }`
  },
  {
    id: "k9", cat: "kotlin", q: "const val vs val — когда именно вычисляется значение?",
    what: "Обе объявляют неизменяемую ссылку, но отличаются МОМЕНТОМ вычисления значения.",
    key: "const val — константа времени КОМПИЛЯЦИИ: значение должно быть известно уже при компиляции (только примитивы и String), объявляется на верхнем уровне файла или внутри object/companion object (не может быть внутри обычного класса или функции). Компилятор буквально подставляет значение прямо в байт-код в местах использования (аналог #define в C). val — вычисляется в РАНТАЙМЕ, при первом выполнении соответствующей строки кода, может содержать результат вызова функции.",
    example: "const val API_VERSION = \"v2\" — компилируется в константу. val currentTime = System.currentTimeMillis() — так сделать через const val нельзя, потому что значение не известно на этапе компиляции.",
    code: `const val MAX_RETRY = 3 // время компиляции — только на верхнем уровне или в object

class Config {
    val createdAt = System.currentTimeMillis() // время выполнения — можно внутри класса
}`
  },
  {
    id: "k10", cat: "kotlin", q: "Any, Unit и Nothing — три особых типа Kotlin",
    what: "Три типа на разных 'полюсах' системы типов Kotlin.",
    key: "Any — корень иерархии типов (аналог Object в Java, но без nullable по умолчанию — Any? нужен явно для допуска null). Unit — единственный синглтон-объект, аналог void в Java, но в отличие от void это полноценный тип, который можно использовать как generic-параметр. Nothing — подтип ВСЕХ типов без единого инстанса (0 экземпляров существует в принципе) — используется для функций, которые никогда нормально не возвращают управление (бросают исключение или бесконечный цикл), что позволяет компилятору корректно типизировать выражения вроде val x: String = error(\"...\") — Nothing совместим с любым ожидаемым типом.",
    example: "TODO() возвращает Nothing — именно поэтому код с TODO() компилируется в любом месте, независимо от ожидаемого типа возврата функции.",
    code: `fun fail(message: String): Nothing = throw IllegalStateException(message)

val value: String = if (condition) "ok" else fail("bad state")
// компилируется, потому что Nothing — подтип String`
  },
  {
    id: "k11", cat: "kotlin", q: "В чём разница между == и === в Kotlin?",
    what: "== — проверка структурного равенства (вызывает под капотом .equals()). === — проверка ссылочного равенства (указывают ли обе переменные на ОДИН И ТОТ ЖЕ объект в памяти).",
    key: "Для data class == сравнивает содержимое полей (так как equals() сгенерирован автоматически), а === всегда сравнивает именно ссылки, даже для data class с одинаковыми полями в разных объектах.",
    example: "Классическая ловушка на собесе: два отдельно созданных data class с одинаковыми полями — a == b вернёт true, а a === b вернёт false, потому что это два разных объекта в памяти с одинаковым содержимым.",
    code: `data class Point(val x: Int, val y: Int)
val p1 = Point(1, 2)
val p2 = Point(1, 2)
println(p1 == p2)  // true — содержимое совпадает
println(p1 === p2) // false — это два разных объекта в памяти`
  },
  {
    id: "k12", cat: "kotlin", q: "Sequences vs Collections — в чём разница в вычислении цепочки операторов?",
    what: "Collections (List/Set/Map) выполняют каждый оператор цепочки СРАЗУ и полностью, создавая промежуточную коллекцию на каждом шаге. Sequence выполняет операторы ЛЕНИВО — элемент за элементом проходит ВСЮ цепочку операторов, прежде чем взяться за следующий элемент, без создания промежуточных коллекций.",
    key: "На большой коллекции с несколькими цепочечными операторами (map().filter().take(5)) обычный List создаст полный промежуточный список на каждом шаге (map создаёт весь новый список, потом filter — ещё один и т.д.), а Sequence обработает ровно столько элементов, сколько нужно для получения первых 5 результатов, и остановится раньше — экономя и память, и время.",
    example: "Правило: для коротких коллекций разница незаметна и Sequence даже может быть медленнее (накладные расходы на обёртку); для больших коллекций с длинными цепочками операторов и early-exit операциями (take, first) — Sequence выигрывает ощутимо.",
    code: `val result = list.asSequence()
    .map { it * 2 }      // не выполняется сразу
    .filter { it > 10 }  // не выполняется сразу
    .first()             // ТОЛЬКО здесь запускается вся цепочка, поэлементно, до первого подходящего`
  },
  {
    id: "k13", cat: "kotlin", q: "Как работает деструктуризация (componentN) и почему у List только 5 компонентов по умолчанию?",
    what: "Деструктуризация — синтаксис val (a, b) = pair, который под капотом вызывает функции component1(), component2() и так далее у объекта справа.",
    key: "data class автоматически генерирует componentN() для каждого поля конструктора. У встроенного List в Kotlin определены только component1()...component5() как extension-функции стандартной библиотеки — для шестого элемента их просто не предусмотрели, поэтому val (a,b,c,d,e,f) = list не скомпилируется без своей component6().",
    example: "Решение — написать свою extension-функцию component6() для List<T>, и деструктуризация с шестью переменными заработает, потому что компилятор просто ищет функцию с нужным именем, а не какой-то встроенный жёстко заданный список.",
    code: `operator fun <T> List<T>.component6(): T = this[5]

val (a, b, c, d, e, f) = listOf(1, 2, 3, 4, 5, 6) // теперь скомпилируется`
  },
  {
    id: "k14", cat: "kotlin", q: "Что такое value class (бывшие inline class) и зачем нужны?",
    what: "value class — обёртка над ОДНИМ значением, которая на этапе компиляции в большинстве случаев 'исчезает' и заменяется напрямую самим значением, не создавая реального объекта-обёртки в памяти.",
    key: "Даёт типобезопасность без цены в производительности — например, вместо того чтобы передавать простой Int как userId (и случайно перепутать его местами с productId, тоже Int), можно завести value class UserId(val value: Int), и компилятор не даст перепутать их местами, при этом в большинстве мест в скомпилированном байт-коде реального объекта-обёртки не будет — только чистый Int.",
    example: "Обёртка всё же материализуется в реальный объект в отдельных случаях (например, если value class используется как generic-параметр, или хранится в коллекции) — это единственный компромисс механизма.",
    code: `@JvmInline
value class UserId(val value: Int)

@JvmInline
value class ProductId(val value: Int)

fun getUser(id: UserId) { /* ... */ }
// getUser(ProductId(5)) — не скомпилируется, хотя оба обёртки над Int`
  },
  {
    id: "k15", cat: "kotlin", q: "Как работают делегированные свойства (property delegation) через by?",
    what: "Делегирование свойства — механизм, при котором логика чтения/записи свойства передаётся ДРУГОМУ объекту (делегату), который реализует специальные операторные функции getValue()/setValue().",
    key: "Компилятор просто вызывает делегат.getValue(...) вместо прямого чтения поля, и делегат.setValue(...) вместо прямой записи — это позволяет вынести повторяющуюся логику (например, 'сохранить в SharedPreferences при изменении') в один переиспользуемый класс-делегат вместо дублирования кода в каждом свойстве (прямое применение DRY).",
    example: "by lazy и lateinit — тоже, по сути, делегаты стандартной библиотеки; своим делегатом можно реализовать, например, автоматическое сохранение значения в SharedPreferences при каждой записи в свойство.",
    code: `class PreferenceDelegate<T>(private val prefs: SharedPreferences, private val key: String, private val default: T) {
    operator fun getValue(thisRef: Any?, property: KProperty<*>): T =
        prefs.getString(key, default.toString()) as T
    operator fun setValue(thisRef: Any?, property: KProperty<*>, value: T) {
        prefs.edit().putString(key, value.toString()).apply()
    }
}

class Settings(prefs: SharedPreferences) {
    var username: String by PreferenceDelegate(prefs, "username", "") // не дублируем логику в каждом свойстве
}`
  },

  {
    id: "a10", cat: "android", q: "BroadcastReceiver: статическая vs динамическая регистрация, sticky broadcast, ограничения Android 8",
    what: "BroadcastReceiver получает системные или кастомные широковещательные сообщения (broadcast) — например, о смене заряда батареи или о завершении загрузки файла.",
    key: "Статическая регистрация (в AndroidManifest.xml) — ресивер живёт независимо от состояния приложения, даже если оно закрыто. Динамическая регистрация (registerReceiver() в коде) — привязана к жизненному циклу компонента, где её вызвали (обычно снимается в onStop/onDestroy). Начиная с Android 8.0, статическая регистрация для большинства неявных (implicit) broadcast'ов ЗАПРЕЩЕНА — это было сделано, чтобы приложения не просыпались в фоне от чужих системных событий и не сажали батарею; динамическая регистрация по-прежнему разрешена для любых broadcast'ов.",
    example: "Sticky broadcast (устаревший, не рекомендуется) — broadcast, который система 'запоминает' и сразу же отдаёт новому подписчику при регистрации, даже если broadcast был отправлен до его подписки (пример — ACTION_BATTERY_CHANGED).",
    code: null
  },
  {
    id: "a11", cat: "android", q: "Started vs Bound vs Foreground Service — и что означают START_STICKY/START_NOT_STICKY/START_REDELIVER_INTENT?",
    what: "Service — компонент для выполнения работы без пользовательского интерфейса, но с разными моделями взаимодействия с остальным приложением.",
    key: "Started Service — запускается через startService()/startForegroundService() и работает независимо, пока сам себя не остановит или его не остановят снаружи; не возвращает результат напрямую вызывающему. Bound Service — клиент-серверная модель: компонент 'привязывается' (bindService()) и может вызывать методы сервиса напрямую и получать результат, сервис живёт, пока есть хотя бы один привязанный клиент. Foreground Service — Started Service с обязательным постоянным уведомлением, получает повышенный приоритет процесса и не убивается системой так же легко, как обычный фоновый сервис.",
    example: "Возвращаемое значение onStartCommand() определяет поведение при принудительном убийстве системой: START_STICKY — перезапустить сервис БЕЗ исходного Intent (аудиоплеер — не обязательно продолжать играть именно тот трек). START_NOT_STICKY — не перезапускать вообще (неважная фоновая задача). START_REDELIVER_INTENT — перезапустить с ТЕМ ЖЕ Intent, с которым сервис был запущен последний раз (важно для докачки большого файла — нужно повторить именно ту же задачу).",
    code: null
  },
  {
    id: "a12", cat: "android", q: "WorkManager vs Service — когда что использовать?",
    what: "WorkManager — библиотека Jetpack для ГАРАНТИРОВАННОГО выполнения отложенной или периодической фоновой работы, которая должна произойти даже если приложение закрыто или устройство перезагрузили.",
    key: "WorkManager сам решает ОПТИМАЛЬНЫЙ момент запуска задачи с учётом состояния системы (заряд батареи, наличие Wi-Fi, Doze Mode) — это фасад¹ поверх JobScheduler/AlarmManager/BroadcastReceiver в зависимости от версии Android. Service (обычный или Foreground) — для работы, которая должна выполняться ПРЯМО СЕЙЧАС и заметно для пользователя (аудио, навигация, звонок) — WorkManager для такого не годится, потому что не гарантирует немедленный запуск.",
    example: "Правило: периодическая синхронизация данных раз в час → WorkManager. Воспроизведение музыки, которое пользователь должен видеть и контролировать прямо сейчас → Foreground Service.",
    code: null
  },
  {
    id: "a13", cat: "android", q: "Что такое PendingIntent и чем отличается от обычного Intent?",
    what: "Intent описывает намерение выполнить действие ПРЯМО СЕЙЧАС, от имени текущего приложения. PendingIntent — 'обёртка' вокруг Intent, которая передаётся ДРУГОМУ приложению/компоненту системы (например, системе уведомлений или AlarmManager), чтобы то выполнило это действие ПОЗЖЕ, но с правами (permissions) исходного приложения, которое создало PendingIntent.",
    key: "Именно PendingIntent позволяет системе (например, при тапе на уведомление) запустить Activity твоего приложения, хотя сама система не имеет прямого доступа к его компонентам — она просто 'исполняет' заранее подготовленный PendingIntent от имени приложения.",
    example: "Уведомления, AlarmManager (запланированные напоминания), виджеты на рабочем столе — все используют PendingIntent, потому что действие инициирует не само приложение, а внешний компонент системы.",
    code: null
  },
  {
    id: "a14", cat: "android", q: "commit() vs apply() в SharedPreferences?",
    what: "Оба сохраняют изменения (Editor) в SharedPreferences, но отличаются синхронностью и возвращаемым результатом.",
    key: "commit() — синхронный, блокирует вызывающий поток до завершения записи на диск, возвращает boolean (успех/неуспех). apply() — асинхронный, немедленно применяет изменения в памяти (доступны сразу же для чтения) и в фоне записывает на диск, ничего не возвращает — не даёт узнать, успешно ли записалось физически.",
    example: "Правило: apply() почти всегда предпочтительнее, если не нужно знать точный результат записи синхронно (не блокирует UI-поток) — commit() оправдан только когда критично дождаться подтверждения записи перед следующим шагом.",
    code: null
  },
  {
    id: "a15", cat: "android", q: "Как связаны Handler, Looper и MessageQueue?",
    what: "Три компонента, вместе реализующие механизм очереди сообщений (event loop¹) для однопоточной обработки задач в Android — именно так работает главный (UI) поток.",
    key: "Looper — бесконечный цикл, который постоянно вытаскивает сообщения из MessageQueue своего потока и по одному отдаёт их на обработку. MessageQueue — сама очередь сообщений/задач, привязанная к конкретному потоку. Handler — точка входа для ОТПРАВКИ сообщений/Runnable в очередь конкретного потока (и точка их ОБРАБОТКИ через handleMessage()) — Handler привязывается к Looper того потока, в котором был создан (или которому явно передан).",
    example: "У главного потока Looper создаётся системой автоматически при старте приложения (Looper.getMainLooper()) — именно поэтому Handler(Looper.getMainLooper()) из фонового потока позволяет доставить код на выполнение в UI-поток.",
    code: null
  },
  {
    id: "a16", cat: "android", q: "Serializable vs Parcelable — почему Android рекомендует именно Parcelable?",
    what: "Оба механизма превращают объект в поток байт для передачи между компонентами (например, через Intent extras).",
    key: "Serializable — стандартный Java-механизм, использует рефлексию¹ для автоматического определения полей для сериализации — удобно (минимум кода), но заметно медленнее и создаёт больше временных объектов (мусора для сборщика), что критично на ограниченных ресурсах мобильного устройства. Parcelable — Android-специфичный механизм, где разработчик явно описывает, как объект пишется/читается из Parcel — требует больше кода (или аннотацию @Parcelize в Kotlin, которая генерирует его автоматически), зато работает в разы быстрее без рефлексии.",
    example: "В современном Kotlin-проекте разница в объёме кода почти исчезает благодаря @Parcelize — поэтому нет практической причины использовать Serializable для Android-специфичной передачи данных.",
    code: `@Parcelize
data class User(val name: String, val age: Int) : Parcelable
// Компилятор сам генерирует writeToParcel/createFromParcel — код почти как у Serializable,
// а производительность — как у ручного Parcelable`
  },
  {
    id: "a17", cat: "android", q: "SavedStateHandle vs onSaveInstanceState vs ViewModel — что переживает что?",
    what: "Три разных механизма сохранения состояния, переживающих РАЗНЫЕ типы уничтожения компонента.",
    key: "ViewModel сам по себе переживает смену конфигурации (поворот экрана), но НЕ переживает смерть процесса системой (когда Android убивает приложение в фоне ради памяти). onSaveInstanceState()/Bundle — переживает и смену конфигурации, и смерть процесса (система сохраняет Bundle отдельно от процесса), но ограничен по объёму (см. карточку про лимит Bundle) и подходит только для небольших примитивных данных. SavedStateHandle — современное решение, встроенное в ViewModel: автоматически связывает данные с тем же механизмом, что и onSaveInstanceState, но с удобным API внутри ViewModel — получаешь и переживание конфигурации (от ViewModel), и переживание смерти процесса (от SavedStateHandle) одновременно.",
    example: "Практическое правило: если данные можно легко перезапросить заново (например, из сети) — SavedStateHandle не нужен, обычного ViewModel достаточно. Если данные введены пользователем и их жалко терять (текст в поиске) — используй SavedStateHandle.",
    code: `class SearchViewModel(private val savedState: SavedStateHandle) : ViewModel() {
    var query: String
        get() = savedState.get<String>("query") ?: ""
        set(value) { savedState.set("query", value) } // переживёт и поворот, и смерть процесса
}`
  },
  {
    id: "a18", cat: "android", q: "Что такое ANR и как его можно детектировать самостоятельно?",
    what: "ANR (Application Not Responding) — системное предупреждение, возникающее, когда главный (UI) поток заблокирован слишком долго (обычно 5 секунд для Activity, меньше для BroadcastReceiver) и не успевает обработать очередное системное событие.",
    key: "Причина почти всегда одна — тяжёлая синхронная операция (сеть, диск, сложные вычисления) выполняется прямо в UI-потоке вместо фонового. Самодельный детектор ANR обычно строится на простом трюке: из фонового потока регулярно (например, раз в 5 секунд) отправлять пустое сообщение в Handler главного потока и замерять, сколько реально прошло времени, пока это сообщение обработалось — если разница сильно больше ожидаемой, значит главный поток был чем-то заблокирован.",
    example: "Инструменты для реальной диагностики (а не самодельные): StrictMode (ловит дисковые/сетевые операции в UI-потоке ещё в разработке) и системные ANR-трейсы (/data/anr/traces.txt на устройстве).",
    code: null
  },
  {
    id: "a19", cat: "android", q: "Что делают ProGuard/R8, и в чём разница обфускации, минификации и оптимизации кода?",
    what: "R8 — современный компилятор/оптимизатор кода в Android (заменил старый ProGuard), выполняющий три отдельные задачи при сборке релизной версии.",
    key: "Минификация (shrinking) — удаление неиспользуемого кода и ресурсов, чтобы уменьшить размер APK. Обфускация (obfuscation) — переименование классов/методов/полей в короткие бессмысленные имена (a, b, c...), чтобы затруднить реверс-инжиниринг¹ приложения конкурентами/злоумышленниками. Оптимизация (optimization) — упрощение самого байт-кода (инлайнинг мелких методов, удаление мёртвых веток кода) для ускорения работы приложения.",
    example: "Частая практическая проблема — обфускация может сломать код, использующий рефлексию (например, парсинг JSON по именам полей) — поэтому для таких классов приходится явно прописывать правила keep в конфигурации ProGuard/R8, чтобы их имена не переименовывались.",
    code: null
  },
  {
    id: "a20", cat: "android", q: "compileSdk vs targetSdk vs minSdk — в чём разница?",
    what: "Три разных числа в конфигурации Gradle, отвечающих за три разных аспекта совместимости приложения с версиями Android.",
    key: "minSdk — минимальная версия Android, на которой приложение вообще СМОЖЕТ запуститься (более старые устройства не смогут установить приложение из Google Play). compileSdk — версия SDK, с которой компилируется код (даёт доступ к новым API/классам на этапе разработки), не влияет напрямую на поведение в рантайме. targetSdk — версия, ПОД ПОВЕДЕНИЕ которой приложение 'подписывается' — начиная именно с этой версии Android применяет к приложению новые системные ограничения и изменения поведения (например, ограничения на фоновые сервисы из Android 8 применятся, только если targetSdk >= 26).",
    example: "Google Play требует регулярно повышать targetSdk до актуальных версий — иначе приложение перестают пускать в обновления/публикацию, даже если minSdk остаётся низким для поддержки старых устройств.",
    code: null
  },
  {
    id: "a21", cat: "android", q: "Doze Mode vs App Standby — в чём разница этих режимов энергосбережения?",
    what: "Два независимых механизма Android для экономии батареи за счёт ограничения фоновой активности приложений, но срабатывающих по разным условиям.",
    key: "Doze Mode — активируется, когда устройство физически неподвижно (лежит на столе) И экран выключен долгое время: система откладывает сетевые запросы, синхронизацию и джобы для ВСЕХ приложений разом, периодически ненадолго 'просыпаясь' для поддержания минимальной активности. App Standby — применяется ИНДИВИДУАЛЬНО к конкретному приложению, которым пользователь давно не пользовался (даже если устройство активно используется для других задач) — ограничивает именно это приложение в фоновой сетевой активности.",
    example: "Push-уведомления через Firebase Cloud Messaging специально спроектированы так, чтобы 'пробуждать' приложение даже в Doze Mode/App Standby — обычные же фоновые задачи в это время откладываются.",
    code: null
  },
  {
    id: "a22", cat: "android", q: "ContentProvider, ContentResolver и Cursor — как они связаны?",
    what: "ContentProvider — компонент для БЕЗОПАСНОГО обмена структурированными данными между разными приложениями (или внутри одного приложения, если так исторически сложилось), скрывающий за собой любой реальный источник данных (SQLite, файлы, сеть).",
    key: "ContentResolver — универсальный клиентский API, через который любой код обращается к ЛЮБОМУ ContentProvider'у (своему или чужому) по единообразному URI-адресу (content://...), не зная деталей его внутренней реализации. Cursor — объект-курсор, который ContentProvider возвращает в ответ на query() — это 'указатель' на строку результата в наборе данных, а не сразу все данные целиком, что экономит память при больших выборках.",
    example: "Системные ContentProvider'ы — примеры из реальной жизни: контакты телефона (ContactsContract), медиатека (MediaStore) — сторонние приложения читают их именно через ContentResolver, не имея прямого доступа к внутренней БД этих системных данных.",
    code: null
  },

  // ---------------- LIFEHACKS ----------------
  {
    id: "l1", cat: "lifehacks", q: "Структура ответа на любой теоретический вопрос",
    what: "Твоя рабочая формула, которая уже подтверждена на реальных мок-собесах: 'что это -> ключевое отличие -> пример/следствие'.",
    key: "Она решает твою главную повторяющуюся проблему — правильная интуиция, но неточная терминология и слабое механистическое объяснение 'как это работает под капотом'. Формула заставляет сначала явно определить понятие, потом назвать РОВНО то отличие, которое отвечает на вопрос, и только потом иллюстрировать кодом.",
    example: "Плохо: 'ну, coroutineScope и supervisorScope они типа похожи, просто в одном по-другому исключения'. Хорошо: 'Это builder'ы для structured concurrency. Отличие — в coroutineScope падение любого child отменяет всех, в supervisorScope — нет. Пример: supervisorScope для независимых параллельных загрузок'.",
    code: null
  },
  {
    id: "l2", cat: "lifehacks", q: "Что делать, если вопрос неизвестен вообще",
    what: "Интервьюер видит по глазам, когда ты придумываешь на ходу — это выглядит хуже, чем честное 'не знаю, но вот как бы я стал разбираться'.",
    key: "Формула: 1) честно скажи, что не сталкивался конкретно с этим; 2) назови ближайшее знакомое понятие и предположи логическую связь ('это похоже на X, значит, вероятно...'); 3) скажи, где бы посмотрел (документация, исходники). Это показывает инженерное мышление даже без готового ответа.",
    example: "'С @AssistedFactory руками не работал, но по названию похоже на паттерн Factory поверх обычного DI — предположу, что он нужен для параметров, которые нельзя достать из графа. Проверил бы в официальной доке Dagger по Assisted Injection.'",
    code: null
  },
  {
    id: "l3", cat: "lifehacks", q: "Формат system design интервью для мобильной разработки",
    what: "В отличие от backend system design, мобильный system design почти никогда не про масштабирование серверов — он про архитектуру конкретного экрана/фичи на клиенте.",
    key: "Стандартная структура интервью: 1) Requirements gathering — задай уточняющие вопросы (offline-режим нужен? real-time обновления? какая нагрузка на UI список — 10 или 10000 элементов?). 2) High-level architecture — слои (Presentation/Domain/Data), выбор источников данных (кэш + сеть), стратегия синхронизации. 3) Deep dive в 1-2 компонента по запросу интервьюера (например, 'как именно сделаешь offline-first кэш?').",
    example: "Не спеши сразу рисовать слои — 2 минуты на уточняющие вопросы почти всегда поднимают твою оценку сильнее, чем красивая диаграмма без контекста требований.",
    code: null
  },
  {
    id: "l4", cat: "lifehacks", q: "Как использовать footnote-подход для терминов на собесе",
    what: "Если используешь корпоративный/жаргонный термин ('boilerplate', 'race condition', 'backpressure') — сразу поясни его одним словом, не жди вопроса.",
    key: "Это показывает, что ты понимаешь термин, а не просто запомнил слово. Заодно снижает риск, что интервьюер решит, будто ты используешь buzzword без понимания.",
    example: "'Тут будет race condition — то есть непредсказуемый результат из-за одновременного доступа к общим данным из разных потоков' — одна короткая вставка, без лекции.",
    code: null
  },

  // ---------------- RESUME ----------------
  {
    id: "r1", cat: "resume", q: "Структура резюме на Middle Android",
    what: "Резюме должно за 6-10 секунд первого просмотра ответить рекрутеру на вопрос 'подходит ли этот человек по стеку и уровню'.",
    key: "Рабочий порядок блоков: 1) Заголовок с ролью и ключевым стеком (Android Developer | Kotlin, Compose, Coroutines). 2) Опыт работы — с конкретными технологиями и результатами (не просто 'участвовал в разработке', а что именно сделал). 3) Pet-проект как отдельный сильный пункт, если в опыте пока мало 'взрослых' задач. 4) Стек технологий отдельным блоком для быстрого сканирования ATS/рекрутером. 5) Образование — коротко, не в начале, если оно не в IT.",
    example: "У тебя: Wildberries в опыте + WeatherApp как pet-проект с Clean Architecture/MVVM/MVI/Hilt/Compose — это ровно тот 'сильный pet-проект компенсирует небольшой формальный опыт' паттерн, который стоит явно показать.",
    code: null
  },
  {
    id: "r2", cat: "resume", q: "Как описывать pet-проект (WeatherApp), чтобы это выглядело серьёзно",
    what: "Разница между 'сделал приложение погоды' и описанием, которое реально впечатляет — в конкретике архитектурных решений и обоснований.",
    key: "Формула для пункта: технология/решение -> зачем именно так (что это даёт) -> конкретный элемент, который можно спросить на собесе. Не перечисляй технологии списком без контекста — каждая должна быть 'подсказкой' для интервьюера, о чём тебя можно расспросить (и ты правда должен быть готов рассказать детали).",
    example: "'Реализовал MVI с State/Event/Effect на 3 экранах (Favourites/Search/Detail) — однонаправленный поток данных упростил тестирование и отладку по сравнению с россыпью LiveData полей' звучит сильнее, чем просто 'использовал MVI'.",
    code: null
  },
  {
    id: "r3", cat: "resume", q: "Сопроводительное письмо — нужно ли и что писать",
    what: "Для Middle-позиций в крупных компаниях (Т-Банк, Яндекс, Авито) сопроводительное не всегда обязательно, но резко выделяет резюме среди потока откликов.",
    key: "Хорошее сопроводительное — не пересказ резюме, а 3-4 предложения: почему именно эта компания/команда, какой конкретно опыт из твоего бэкграунда релевантен именно этой вакансии (не общими словами), готовность к формату (например, к тестовому заданию).",
    example: "Упоминание конкретной технологии из вакансии, которая у тебя есть ('вижу, что у вас в стеке Compose Multiplatform — у меня есть опыт с Compose в WeatherApp') работает сильнее общих фраз про 'быстро обучаюсь и мотивирован'.",
    code: null
  },
];
