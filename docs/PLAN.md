# Motion Captions Studio — plan projektu
Data researchu: 2026-11-13. Nazwa robocza; repozytorium zdalne jeszcze nieutworzone.
Status: plan i audyt dokumentacji, bez benchmarku runtime.
Konto GitHub potwierdzone przez konektor: aievolutionpl.

## Cel
Lokalny edytor short-form video, w którym człowiek i agent pracują na tym samym, edytowalnym projekcie. Import filmu -> transkrypcja -> propozycja kompozycji -> korekta w podglądzie i timeline -> eksport MP4.
Pierwszy cel: materiały pionowe 15–90 sekund, polski i angielski, 1080x1920/30 fps. Nie obiecujemy automatycznej rekonstrukcji dowolnej referencji.

## Materiały referencyjne
Pierwszy film: 26,816 s, 720x1280, H.264/30 fps. Duża typografia za postacią, liczniki, grafiki, zmiany układu.
Drugi film: 31,933 s, 720x1280, HEVC/30 fps. Mieszane fonty, tekst za głową, tekst po konturze, wycięta postać, zmiana tła.
Analiza dotychczas: kontaktowe arkusze klatek. Nie wykonano oceny audio ani dokładnego pomiaru synchronizacji.
Do benchmarków potrzebny również czysty materiał źródłowy: wypalone napisy w referencjach nie są edytowalne. W pierwszym teście możemy wykorzystać fragmenty/syntetyczny materiał, ale referencje służą przede wszystkim jako cel wizualny.

## Opis autora
https://ruby-cotija-fb5.notion.site/How-I-edited-my-captions-reel-with-AI-40b28691eca381a3ad10cbc917160c2d
Odczytano tylko początek strony, do nagłówka „3. The timing”.
Autor wskazuje Claude Code + Remotion, Beeble do zmiany otoczenia, BiRefNet do masek per klatka, Whisper do transkrypcji i Adobe Podcast do oczyszczenia głosu.
Nie potwierdzono dalszych instrukcji, promptu ani udostępnienia kodu autora.

## Decyzja wstępna
Pierwszy kandydat: fork FableCut, bez przepisywania UI ani silnika na nowy framework.
Alternatywa po nieudanym audycie: własny edytor na Remotion, opcjonalnie oficjalny Editor Starter po ocenie licencji i kosztu.
Nie wdrażać dwóch niezależnych rendererów na początku.

### FableCut
https://github.com/ronak-create/FableCut
https://github.com/ronak-create/FableCut/blob/main/CLAUDE.md
https://github.com/ronak-create/FableCut/blob/main/LICENSE
Odczytany package.json: 1.18.0; odczytany main SHA: 579b08ec1a789baec5cbf06d7430373460508d09.
Licencja MIT sprawdzona w pliku. Przed forkiem zachować LICENSE i zweryfikować licencje modeli, fontów oraz zależności.
Potwierdzone w dokumentacji: JSON timeline, MCP/REST, historia, patch z baseRevision, edycja ręczna, maski, MediaPipe person cut-out, region tracking, textPath, motion blur, zagnieżdżone kompozycje.
Odczytany captions.js: cztery podstawowe style (subtitle/karaoke/highlight/pop), grouping słów i wordTimes. To nie jest gotowy zaawansowany reżyser typografii.
Tracker opisano jako template matching; nie jest to automatycznie wysokiej jakości tracker semantyczny twarzy.
Brakuje dowodu wydajności i jakości eksportu dla naszych referencji. Nie uruchomiono aplikacji/testów.

### OpenMontage
https://github.com/OpenMontageInc/OpenMontage
https://github.com/OpenMontageInc/OpenMontage/blob/main/LICENSE
Właściwy projekt odnaleziony przez przekierowanie calesthio/OpenMontage. Zweryfikowana licencja AGPLv3.
Platforma pipeline'ów produkcyjnych i narzędzi agentowych; Backlot dokumentuje storyboard, postęp i akceptacje. Nie potwierdzono równoważnego edytora timeline dla naszego zastosowania.
Nie wybierać jako rdzenia UI. Ewentualna późniejsza integracja przez jawny kontrakt; nie kopiować kodu AGPL do części traktowanej jako MIT.

### Pozostałe
Tscaps: https://github.com/francozanardi/tscaps — kandydat caption-only; silnik i templates MIT, studio AGPL. Nie dokładać drugiego silnika tylko dla presetów.
Remotion: https://www.remotion.dev/docs/editor-starter — alternatywa zgodna z workflow autora, ale osobna licencja i płatny starter.
Warunki: https://www.remotion.dev/pricing — weryfikować przy decyzji zakupowej.

## Architektura docelowa (propozycja)
1. Editor: istniejący frontend FableCut, inspector, transcript, timeline, wybór obiektów i stylów.
2. Project core: jeden dokument projektu, stabilne ID, wersjonowany schemat, grupy captionScene, referencje do assetów, czasu i masek.
3. Commands: jedna warstwa operacji dla GUI i agenta. Walidacja -> kontrola revision -> atomowy zapis -> historia -> odświeżenie UI.
4. Caption scenes: mieszane style słów, layout, templateId/version, parametry animacji, tracking binding i editable path. Rozszerzyć istniejący model, nie tworzyć konkurencyjnego dokumentu.
5. Media jobs: FFmpeg/proxy, transcription, masks, tracking, exports. Jawne stany queued/running/succeeded/failed/cancelled, postęp, cache i ponowienia.
6. Agent: MCP używane przez Codex/Claude/innego klienta + mały skill opisujący workflow. Wbudowany płatny czat może dojść później.
7. Render: ten sam evaluator scen i te same fonty dla podglądu oraz finalnego eksportu. Proxy tylko w podglądzie, oryginał w eksporcie.

MVP działa lokalnie: przeglądarka + proces Node. Python worker dopiero gdy potrzebny dla lepszych masek.
BiRefNet to kandydat do testów, nie zatwierdzona zależność: zbadać licencję konkretnego modelu, koszty GPU, krawędzie włosów i migotanie między klatkami.
Beeble i Adobe Podcast nie są zależnościami MVP. Można importować uprzednio przygotowane wideo/audio. Nie zakładać niezweryfikowanych API.

## Kontrakt agenta
Rozszerzyć istniejące MCP zamiast dawać nieograniczony zapis plików.
Przykładowe przyszłe operacje: create_caption_scene, apply_caption_style, update_word, attach_to_track, set_text_path, render_preview.
To nazwy projektowane, nie istniejące API.
Agent otrzymuje wybrany zakres, skrót transkrypcji, dostępne style i revision.
Zwraca walidowane operacje, a nie dowolny JavaScript. Nowe efekty kodowe przechodzą normalny proces deweloperski.
Każda paczka zmian ma autora, operationId i baseRevision; jedno Undo cofa całą paczkę.
Konflikt z ręczną zmianą: odczyt aktualnego stanu i ponowne przygotowanie zmiany, bez wymuszonego nadpisania.
Agent widzi klatki renderu, poprawia projekt i generuje próbkę przed długim eksportem.
Lokalny MCP preferowany. REST dostępny lokalnie, z kontrolą origin/auth; ograniczenia ścieżek, brak sekretów w projekcie. Wyjście do zewnętrznych usług jest jawne.

## Milestones i warunki ukończenia
### M0 — audyt wykonalności, przed wyborem fundamentu
- Przypiąć FableCut do SHA, przeczytać AGENTS/README/security, uruchomić istniejące testy.
- Import obu MOV: H.264 i HEVC, orientacja, audio, proxy i relink.
- Odtworzyć 3 sceny po 5–10 s: mieszana typografia; tekst za głową; tekst po edytowalnej krzywej.
- Edycja GUI -> agent -> GUI -> undo -> zapis -> ponowne otwarcie.
- Eksport 1080x1920/30 fps z dźwiękiem; 60 fps dopiero po benchmarku.
- Zapisać sprzęt, czas eksportu, szczyt RAM/VRAM, płynność podglądu, jakość masek i różnice renderu.
- Kryteria: zero utraconych zmian, zero brakujących fontów i czarnych klatek; brak narastającego dryfu AV, docelowo <= 1 klatka na fixture; akceptacja wizualna 3 scen.
- W razie niepowodzenia zrobić mały porównawczy render w Remotion i zapisać ADR. Nie przepisywać całego produktu w ciemno.

### M1 — działający przepływ end-to-end
Import -> transkrypcja PL/EN -> korekta słów/czasu -> trzy style -> ręczna edycja -> save/reopen -> MP4.
Style: clean, bold kinetic, editorial mixed-type.
Każde słowo i układ pozostają edytowalne. Import SRT nie udaje dokładnych timingów słów.
Undo/redo, autosave, anulowanie renderu, czytelne błędy i bezpieczne wznowienie jobów.

### M2 — głębia i ścieżki
Tekst za postacią, mask cache, ręczna poprawka maski, przyczepianie do tracka.
Tekst po ręcznej krzywej; automatyczny kontur sylwetki dopiero po stabilizacji masek.
Rozróżnić geometrię ścieżki i offset animacji. Stabilizować kontur, aby litery nie drgały.
Tracking z sygnalizacją niskiej pewności i możliwością ponownego wskazania punktu.
Ruch kamery, skalowanie i maska muszą używać wspólnych współrzędnych i czasu źródła.

### M3 — agent i skill
Sterowanie wybranymi scenami przez MCP, podgląd różnicy i historii.
Polecenia: „podkreśl te trzy słowa”, „zmień tylko ten fragment”, „przenieś napis za głowę”.
Agent nie usuwa ręcznych korekt poza swoim zakresem. Próba A/B dla stylu.
Test kontraktowy: GUI i MCP dają ten sam stan i klatkę dla tych samych operacji.

### M4 — biblioteka i dystrybucja
Pakiety stylów z parametrami, fontami/licencjami i miniaturami.
Instalator Windows lub prosty launcher dopiero po stabilnym lokalnym MVP.
Generowanie teł, stock, chmura, płatności i współpraca wielu użytkowników poza MVP.

## Plan GitHub
Proponowana nazwa: aievolutionpl/motion-captions-studio (do ustalenia; bez utworzenia repo w tym etapie).
Po decyzji M0: fork FableCut albo osobne repo z zachowaną historią/atrybucją, zależnie od wybranej widoczności i sposobu rozwoju.
Nie obiecywać prywatności zwykłego forka publicznego repo. Jeśli potrzebne prywatne repo, przygotować osobną kopię zgodną z MIT.
Pliki startowe: README.md, AGENTS.md, docs/PLAN.md, docs/adr/0001-foundation.md, THIRD_PARTY_NOTICES.md.
Issues według M0–M4; małe branche i PR, każda zmiana z testem lub renderem dowodowym.
CI: istniejące testy upstream, walidacja schematu, smoke import/export, snapshoty klatek w przypiętym środowisku. Testy GPU oddzielnie.
Duże filmy, masks, cache, exports, modele i .env poza Git. Małe legalne fixtures, licencje fontów i manifest wersji w repo.
Nie dodawać pełnych filmów referencyjnych użytkownika do publicznego repo.

## Następny krok
Wykonać M0, zanim zadeklarujemy FableCut jako ostateczną bazę. Do startu produkcji potrzebny będzie czysty klip testowy.
Ten dokument jest planem, nie dowodem gotowego programu, działającego renderu ani utworzonego GitHub repo.
