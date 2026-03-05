import { Injectable } from '@angular/core';
declare var initSqlJs: any;

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  db: any = null;

  constructor() {}

  async initDatabase(): Promise<void> {
    if (this.db) return;

    try {
      const SQL = await initSqlJs({
        locateFile: (file: string) => `assets/${file}`
      });
      
      this.db = new SQL.Database();
      // WICHTIG: Foreign Keys in SQLite aktivieren
      this.db.run("PRAGMA foreign_keys = ON;");
      this.createTables();
      console.log("Spotify DB Schema based on ERM created.");
    } catch (err) {
      console.error("Datenbank-Fehler:", err);
      throw new Error("Fehler beim Initialisieren der Datenbank.");
    }
  }

  private createTables() {
    const sql = `
      -- 1. Label (Keine Abhängigkeiten)
      CREATE TABLE Label (
          LabelID INTEGER PRIMARY KEY,
          Name TEXT NOT NULL,
          Sitz TEXT
      );

      -- 2. User (Keine Abhängigkeiten)
      CREATE TABLE User (
          UserID INTEGER PRIMARY KEY,
          Username TEXT NOT NULL,
          Email TEXT,
          Passwort TEXT
      );

      -- 3. Artist (Hängt am Label: 'hat Vertrag')
      CREATE TABLE Artist (
          ArtistID INTEGER PRIMARY KEY,
          Name TEXT NOT NULL,
          LabelID INTEGER,
          FOREIGN KEY(LabelID) REFERENCES Label(LabelID)
      );

      -- 4. Song (Hängt an Artist: 'produziert', Hängt an Label: 'besitzt')
      CREATE TABLE Song (
          SongID INTEGER PRIMARY KEY,
          Titel TEXT NOT NULL,
          Jahr INTEGER,
          Genre TEXT,
          Album TEXT,
          ArtistID INTEGER,
          LabelID INTEGER,
          FOREIGN KEY(ArtistID) REFERENCES Artist(ArtistID),
          FOREIGN KEY(LabelID) REFERENCES Label(LabelID)
      );

      -- 5. Playlist (Hängt an User: 'erstellt')
      CREATE TABLE Playlist (
          PlaylistID INTEGER PRIMARY KEY,
          Name TEXT NOT NULL,
          Datum TEXT, -- SQLite speichert Datum meist als Text (ISO8601)
          Oeffentlich BOOLEAN,
          UserID INTEGER,
          FOREIGN KEY(UserID) REFERENCES User(UserID)
      );

      -- 6. Verknüpfungstabelle: Playlist enthält Song (n:m)
      CREATE TABLE PlaylistSongs (
          PlaylistID INTEGER,
          SongID INTEGER,
          PRIMARY KEY (PlaylistID, SongID),
          FOREIGN KEY(PlaylistID) REFERENCES Playlist(PlaylistID),
          FOREIGN KEY(SongID) REFERENCES Song(SongID)
      );

      -- 7. Verknüpfungstabelle: User gefällt Song (n:m)
      CREATE TABLE UserLikes (
          UserID INTEGER,
          SongID INTEGER,
          PRIMARY KEY (UserID, SongID),
          FOREIGN KEY(UserID) REFERENCES User(UserID),
          FOREIGN KEY(SongID) REFERENCES Song(SongID)
      );

      -- 8. Verknüpfungstabelle: User folgt Artist (n:m)
      CREATE TABLE UserFollows (
          UserID INTEGER,
          ArtistID INTEGER,
          PRIMARY KEY (UserID, ArtistID),
          FOREIGN KEY(UserID) REFERENCES User(UserID),
          FOREIGN KEY(ArtistID) REFERENCES Artist(ArtistID)
      );

      -- 1. LABELS (5 Einträge)
      INSERT INTO Label VALUES (1, 'Universal Music', 'Santa Monica');
      INSERT INTO Label VALUES (2, 'Sony Music', 'New York');
      INSERT INTO Label VALUES (3, 'Warner Music', 'Los Angeles');
      INSERT INTO Label VALUES (4, 'Aggro Berlin', 'Berlin'); -- Legacy ;)
      INSERT INTO Label VALUES (5, 'XL Recordings', 'London');

      -- 2. ARTISTS (12 Einträge)
      INSERT INTO Artist VALUES (1, 'Taylor Swift', 1);
      INSERT INTO Artist VALUES (2, 'The Weeknd', 1);
      INSERT INTO Artist VALUES (3, 'Drake', 1);
      INSERT INTO Artist VALUES (4, 'Adele', 2);
      INSERT INTO Artist VALUES (5, 'Travis Scott', 2);
      INSERT INTO Artist VALUES (6, 'Harry Styles', 2);
      INSERT INTO Artist VALUES (7, 'Ed Sheeran', 3);
      INSERT INTO Artist VALUES (8, 'Dua Lipa', 3);
      INSERT INTO Artist VALUES (9, 'Coldplay', 3);
      INSERT INTO Artist VALUES (10, 'Sido', 4);
      INSERT INTO Artist VALUES (11, 'Peter Fox', 3);
      INSERT INTO Artist VALUES (12, 'Radiohead', 5);

      -- 3. USERS (10 Einträge)
      INSERT INTO User VALUES (1, 'MusicLover99', 'max.mustermann@gmail.com', 'pass1234');
      INSERT INTO User VALUES (2, 'Sophie_Singt', 'sophie.mueller@web.de', 'singtgerne');
      INSERT INTO User VALUES (3, 'HipHopHead', 'lukas.schmidt@yahoo.com', 'yoyoyo');
      INSERT INTO User VALUES (4, 'RockRolf', 'rolf.meier@t-online.de', 'acdc4ever');
      INSERT INTO User VALUES (5, 'Emma_W', 'emma.wagner@gmail.com', 'secret');
      INSERT INTO User VALUES (6, 'TechnoTom', 'tom.becker@gmx.net', 'bassdrop');
      INSERT INTO User VALUES (7, 'Anna_Banana', 'anna.hofmann@icloud.com', 'fruit123');
      INSERT INTO User VALUES (8, 'Chiller_Chris', 'chris.schulz@outlook.com', 'relax');
      INSERT INTO User VALUES (9, 'Lisa_Pop', 'lisa.koch@gmail.com', 'swiftie');
      INSERT INTO User VALUES (10, 'GhostUser', 'keine.email@nichts.de', '123456');

      -- 4. SONGS (35 Einträge)
      -- Taylor Swift
      INSERT INTO Song VALUES (1, 'Cruel Summer', 2019, 'Pop', 'Lover', 1, 1);
      INSERT INTO Song VALUES (2, 'Anti-Hero', 2022, 'Pop', 'Midnights', 1, 1);
      INSERT INTO Song VALUES (3, 'Blank Space', 2014, 'Pop', '1989', 1, 1);
      -- The Weeknd
      INSERT INTO Song VALUES (4, 'Blinding Lights', 2019, 'Synth-Pop', 'After Hours', 2, 1);
      INSERT INTO Song VALUES (5, 'Starboy', 2016, 'R&B', 'Starboy', 2, 1);
      INSERT INTO Song VALUES (6, 'Save Your Tears', 2020, 'Synth-Pop', 'After Hours', 2, 1);
      -- Drake
      INSERT INTO Song VALUES (7, 'Gods Plan', 2018, 'Hip Hop', 'Scorpion', 3, 1);
      INSERT INTO Song VALUES (8, 'One Dance', 2016, 'Hip Hop', 'Views', 3, 1);
      -- Adele
      INSERT INTO Song VALUES (9, 'Hello', 2015, 'Soul', '25', 4, 2);
      INSERT INTO Song VALUES (10, 'Easy On Me', 2021, 'Soul', '30', 4, 2);
      INSERT INTO Song VALUES (11, 'Rolling in the Deep', 2010, 'Soul', '21', 4, 5); -- Kleiner Fehler eingebaut: Label 5 (XL) statt 2 (Sony) für Adele
      -- Travis Scott
      INSERT INTO Song VALUES (12, 'SICKO MODE', 2018, 'Hip Hop', 'Astroworld', 5, 2);
      INSERT INTO Song VALUES (13, 'Goosebumps', 2016, 'Hip Hop', 'Birds', 5, 2);
      -- Harry Styles
      INSERT INTO Song VALUES (14, 'As It Was', 2022, 'Pop', 'Harrys House', 6, 2);
      INSERT INTO Song VALUES (15, 'Watermelon Sugar', 2019, 'Pop', 'Fine Line', 6, 2);
      -- Ed Sheeran
      INSERT INTO Song VALUES (16, 'Shape of You', 2017, 'Pop', 'Divide', 7, 3);
      INSERT INTO Song VALUES (17, 'Perfect', 2017, 'Pop', 'Divide', 7, 3);
      INSERT INTO Song VALUES (18, 'Bad Habits', 2021, 'Pop', 'Equals', 7, 3);
      -- Dua Lipa
      INSERT INTO Song VALUES (19, 'Levitating', 2020, 'Pop', 'Future Nostalgia', 8, 3);
      INSERT INTO Song VALUES (20, 'Don''t Start Now', 2019, 'Pop', 'Future Nostalgia', 8, 3);
      -- Coldplay
      INSERT INTO Song VALUES (21, 'Yellow', 2000, 'Rock', 'Parachutes', 9, 3);
      INSERT INTO Song VALUES (22, 'Viva La Vida', 2008, 'Rock', 'Viva', 9, 3);
      INSERT INTO Song VALUES (23, 'Fix You', 2005, 'Rock', 'X&Y', 9, 3);
      -- Sido
      INSERT INTO Song VALUES (24, 'Mein Block', 2004, 'Hip Hop', 'Maske', 10, 4);
      INSERT INTO Song VALUES (25, 'Bilder im Kopf', 2012, 'Hip Hop', '#Beste', 10, 1); -- Sido bei Universal später
      -- Peter Fox
      INSERT INTO Song VALUES (26, 'Haus am See', 2008, 'Hip Hop', 'Stadtaffe', 11, 3);
      INSERT INTO Song VALUES (27, 'Schwarz zu blau', 2008, 'Hip Hop', 'Stadtaffe', 11, 3);
      -- Radiohead
      INSERT INTO Song VALUES (28, 'Creep', 1992, 'Rock', 'Pablo Honey', 12, 5);
      INSERT INTO Song VALUES (29, 'Karma Police', 1997, 'Rock', 'OK Computer', 12, 5);
      INSERT INTO Song VALUES (30, 'No Surprises', 1997, 'Rock', 'OK Computer', 12, 5);
      -- Mix
      INSERT INTO Song VALUES (31, 'Houdini', 2024, 'Pop', 'New', 8, 3);
      INSERT INTO Song VALUES (32, 'Flowers', 2023, 'Pop', 'Endless Summer', 1, 2); -- Absichtlich falsche Zuordnung für Fehlersuche
      INSERT INTO Song VALUES (33, 'Mockingbird', 2004, 'Hip Hop', 'Encore', 3, 1); 
      INSERT INTO Song VALUES (34, 'Zukunft Pink', 2022, 'Pop', 'Zukunft', 11, 3);
      INSERT INTO Song VALUES (35, 'Schlechtes Vorbild', 2006, 'Hip Hop', 'Ich', 10, 4);

      -- 5. PLAYLISTS (8 Einträge)
      INSERT INTO Playlist VALUES (1, 'Sommer Hits 2024', '2024-06-01', 1, 1); -- User 1
      INSERT INTO Playlist VALUES (2, 'Sad Songs', '2023-11-15', 0, 2); -- User 2, Privat
      INSERT INTO Playlist VALUES (3, 'Gym Motivation', '2024-01-01', 1, 3);
      INSERT INTO Playlist VALUES (4, 'Oldies but Goldies', '2022-05-20', 1, 4);
      INSERT INTO Playlist VALUES (5, 'Hausparty', '2023-12-31', 1, 1);
      INSERT INTO Playlist VALUES (6, 'Lernen und Fokus', '2024-03-10', 0, 5);
      INSERT INTO Playlist VALUES (7, 'Deutschrap Classics', '2020-08-08', 1, 3);
      INSERT INTO Playlist VALUES (8, 'Leere Playlist', '2024-01-01', 1, 6); -- Leer zum Testen von LEFT JOIN

      -- 6. PLAYLISTSONGS (Verknüpfungen n:m)
      -- Sommer Hits (ID 1)
      INSERT INTO PlaylistSongs VALUES (1, 1); -- Cruel Summer
      INSERT INTO PlaylistSongs VALUES (1, 14); -- As It Was
      INSERT INTO PlaylistSongs VALUES (1, 15); -- Watermelon Sugar
      INSERT INTO PlaylistSongs VALUES (1, 19); -- Levitating
      -- Sad Songs (ID 2)
      INSERT INTO PlaylistSongs VALUES (2, 23); -- Fix You
      INSERT INTO PlaylistSongs VALUES (2, 30); -- No Surprises
      INSERT INTO PlaylistSongs VALUES (2, 9); -- Hello
      -- Gym (ID 3)
      INSERT INTO PlaylistSongs VALUES (3, 7); -- Gods Plan
      INSERT INTO PlaylistSongs VALUES (3, 12); -- SICKO MODE
      INSERT INTO PlaylistSongs VALUES (3, 24); -- Mein Block
      -- Oldies (ID 4)
      INSERT INTO PlaylistSongs VALUES (4, 21); -- Yellow
      INSERT INTO PlaylistSongs VALUES (4, 28); -- Creep
      INSERT INTO PlaylistSongs VALUES (4, 3); -- Blank Space (schon alt?)
      -- Deutschrap (ID 7)
      INSERT INTO PlaylistSongs VALUES (7, 24);
      INSERT INTO PlaylistSongs VALUES (7, 26);
      INSERT INTO PlaylistSongs VALUES (7, 35);

      -- 7. USER LIKES (Verknüpfungen n:m)
      -- User 1 mag fast alles von Taylor Swift
      INSERT INTO UserLikes VALUES (1, 1);
      INSERT INTO UserLikes VALUES (1, 2);
      INSERT INTO UserLikes VALUES (1, 3);
      INSERT INTO UserLikes VALUES (1, 14);
      -- User 3 mag HipHop
      INSERT INTO UserLikes VALUES (3, 7);
      INSERT INTO UserLikes VALUES (3, 12);
      INSERT INTO UserLikes VALUES (3, 24);
      INSERT INTO UserLikes VALUES (3, 25);
      -- User 9 (Lisa_Pop)
      INSERT INTO UserLikes VALUES (9, 1);
      INSERT INTO UserLikes VALUES (9, 16);
      INSERT INTO UserLikes VALUES (9, 19);

      -- 8. USER FOLLOWS (Verknüpfungen n:m)
      -- User 1 folgt Taylor Swift, The Weeknd
      INSERT INTO UserFollows VALUES (1, 1);
      INSERT INTO UserFollows VALUES (1, 2);
      -- User 3 folgt Drake, Travis Scott, Sido
      INSERT INTO UserFollows VALUES (3, 3);
      INSERT INTO UserFollows VALUES (3, 5);
      INSERT INTO UserFollows VALUES (3, 10);
      -- User 9 folgt Taylor Swift, Ed Sheeran, Dua Lipa
      INSERT INTO UserFollows VALUES (9, 1);
      INSERT INTO UserFollows VALUES (9, 7);
      INSERT INTO UserFollows VALUES (9, 8);

      -- ============================================
-- ERWEITERTE LABELS (15 zusätzliche)
-- ============================================
INSERT INTO Label VALUES (6, 'Atlantic Records', 'New York');
INSERT INTO Label VALUES (7, 'Columbia Records', 'New York');
INSERT INTO Label VALUES (8, 'Interscope Records', 'Santa Monica');
INSERT INTO Label VALUES (9, 'Capitol Records', 'Los Angeles');
INSERT INTO Label VALUES (10, 'Republic Records', 'New York');
INSERT INTO Label VALUES (11, 'Def Jam Recordings', 'New York');
INSERT INTO Label VALUES (12, 'Island Records', 'London');
INSERT INTO Label VALUES (13, 'Polydor Records', 'London');
INSERT INTO Label VALUES (14, 'RCA Records', 'New York');
INSERT INTO Label VALUES (15, 'Epic Records', 'New York');
INSERT INTO Label VALUES (16, 'Virgin Records', 'London');
INSERT INTO Label VALUES (17, 'Parlophone', 'London');
INSERT INTO Label VALUES (18, 'Vertigo Berlin', 'Berlin');
INSERT INTO Label VALUES (19, 'Four Music', 'Hamburg');
INSERT INTO Label VALUES (20, 'Chimperator', 'Hamburg');

-- ============================================
-- ERWEITERTE ARTISTS (88 zusätzliche = 100 total)
-- ============================================

-- Pop International
INSERT INTO Artist VALUES (13, 'Billie Eilish', 8);
INSERT INTO Artist VALUES (14, 'Ariana Grande', 10);
INSERT INTO Artist VALUES (15, 'Justin Bieber', 11);
INSERT INTO Artist VALUES (16, 'Olivia Rodrigo', 7);
INSERT INTO Artist VALUES (17, 'Shawn Mendes', 12);
INSERT INTO Artist VALUES (18, 'Selena Gomez', 8);
INSERT INTO Artist VALUES (19, 'Camila Cabello', 15);
INSERT INTO Artist VALUES (20, 'Miley Cyrus', 7);
INSERT INTO Artist VALUES (21, 'Katy Perry', 9);
INSERT INTO Artist VALUES (22, 'Lady Gaga', 8);
INSERT INTO Artist VALUES (23, 'Bruno Mars', 6);
INSERT INTO Artist VALUES (24, 'The Chainsmokers', 7);
INSERT INTO Artist VALUES (25, 'OneRepublic', 8);
INSERT INTO Artist VALUES (26, 'Maroon 5', 8);
INSERT INTO Artist VALUES (27, 'Imagine Dragons', 8);

-- Hip Hop / Rap International
INSERT INTO Artist VALUES (28, 'Post Malone', 10);
INSERT INTO Artist VALUES (29, 'Eminem', 8);
INSERT INTO Artist VALUES (30, 'Kendrick Lamar', 8);
INSERT INTO Artist VALUES (31, 'J. Cole', 10);
INSERT INTO Artist VALUES (32, 'Kanye West', 11);
INSERT INTO Artist VALUES (33, 'Nicki Minaj', 10);
INSERT INTO Artist VALUES (34, 'Cardi B', 6);
INSERT INTO Artist VALUES (35, 'Lil Nas X', 7);
INSERT INTO Artist VALUES (36, '21 Savage', 15);
INSERT INTO Artist VALUES (37, 'Megan Thee Stallion', 3);

-- Deutschrap
INSERT INTO Artist VALUES (38, 'Capital Bra', 18);
INSERT INTO Artist VALUES (39, 'Apache 207', 19);
INSERT INTO Artist VALUES (40, 'Bonez MC', 19);
INSERT INTO Artist VALUES (41, 'RAF Camora', 19);
INSERT INTO Artist VALUES (42, 'Bushido', 2);
INSERT INTO Artist VALUES (43, 'Kollegah', 1);
INSERT INTO Artist VALUES (44, 'Farid Bang', 18);
INSERT INTO Artist VALUES (45, 'Haftbefehl', 20);
INSERT INTO Artist VALUES (46, 'Fler', 1);
INSERT INTO Artist VALUES (47, 'Luciano', 10);
INSERT INTO Artist VALUES (48, 'Loredana', 16);
INSERT INTO Artist VALUES (49, 'Shirin David', 1);
INSERT INTO Artist VALUES (50, 'Samra', 10);

-- Deutsche Pop/Schlager
INSERT INTO Artist VALUES (51, 'Mark Forster', 2);
INSERT INTO Artist VALUES (52, 'Max Giesinger', 3);
INSERT INTO Artist VALUES (53, 'Wincent Weiss', 3);
INSERT INTO Artist VALUES (54, 'Sarah Connor', 13);
INSERT INTO Artist VALUES (55, 'Helene Fischer', 13);
INSERT INTO Artist VALUES (56, 'Andreas Bourani', 3);
INSERT INTO Artist VALUES (57, 'Lena', 1);
INSERT INTO Artist VALUES (58, 'Revolverheld', 2);
INSERT INTO Artist VALUES (59, 'Tim Bendzko', 2);

-- Rock / Alternative
INSERT INTO Artist VALUES (60, 'Linkin Park', 3);
INSERT INTO Artist VALUES (61, 'Imagine Dragons', 8);
INSERT INTO Artist VALUES (62, 'Arctic Monkeys', 16);
INSERT INTO Artist VALUES (63, 'The Killers', 12);
INSERT INTO Artist VALUES (64, 'Muse', 3);
INSERT INTO Artist VALUES (65, 'Green Day', 10);
INSERT INTO Artist VALUES (66, 'Foo Fighters', 14);
INSERT INTO Artist VALUES (67, 'Red Hot Chili Peppers', 3);
INSERT INTO Artist VALUES (68, 'Nirvana', 11);
INSERT INTO Artist VALUES (69, 'The Beatles', 17);
INSERT INTO Artist VALUES (70, 'Queen', 12);

-- Electronic / Dance
INSERT INTO Artist VALUES (71, 'David Guetta', 3);
INSERT INTO Artist VALUES (72, 'Calvin Harris', 7);
INSERT INTO Artist VALUES (73, 'Martin Garrix', 2);
INSERT INTO Artist VALUES (74, 'Avicii', 1);
INSERT INTO Artist VALUES (75, 'Marshmello', 10);
INSERT INTO Artist VALUES (76, 'Daft Punk', 7);
INSERT INTO Artist VALUES (77, 'Swedish House Mafia', 10);
INSERT INTO Artist VALUES (78, 'Robin Schulz', 3);
INSERT INTO Artist VALUES (79, 'Felix Jaehn', 1);

-- R&B / Soul
INSERT INTO Artist VALUES (80, 'Beyoncé', 7);
INSERT INTO Artist VALUES (81, 'Rihanna', 11);
INSERT INTO Artist VALUES (82, 'SZA', 14);
INSERT INTO Artist VALUES (83, 'Frank Ocean', 11);
INSERT INTO Artist VALUES (84, 'H.E.R.', 14);
INSERT INTO Artist VALUES (85, 'Khalid', 14);

-- Country / Singer-Songwriter
INSERT INTO Artist VALUES (86, 'Morgan Wallen', 10);
INSERT INTO Artist VALUES (87, 'Luke Combs', 7);
INSERT INTO Artist VALUES (88, 'Sam Smith', 9);
INSERT INTO Artist VALUES (89, 'Lewis Capaldi', 16);
INSERT INTO Artist VALUES (90, 'Lauv', 6);

-- Indie / Alternative
INSERT INTO Artist VALUES (91, 'Lana Del Rey', 8);
INSERT INTO Artist VALUES (92, 'Tame Impala', 8);
INSERT INTO Artist VALUES (93, 'Glass Animals', 13);
INSERT INTO Artist VALUES (94, 'alt-J', 6);
INSERT INTO Artist VALUES (95, 'Hozier', 7);

-- Weitere internationale Künstler
INSERT INTO Artist VALUES (96, 'Bad Bunny', 14);
INSERT INTO Artist VALUES (97, 'Rosalía', 7);
INSERT INTO Artist VALUES (98, 'BTS', 7);
INSERT INTO Artist VALUES (99, 'BlackPink', 12);
INSERT INTO Artist VALUES (100, 'Stray Kids', 10);

-- ============================================
-- ERWEITERTE SONGS (465 zusätzliche = 500 total)
-- ============================================

-- Billie Eilish (ArtistID 13)
INSERT INTO Song VALUES (36, 'bad guy', 2019, 'Pop', 'When We All Fall Asleep', 13, 8);
INSERT INTO Song VALUES (37, 'Happier Than Ever', 2021, 'Pop', 'Happier Than Ever', 13, 8);
INSERT INTO Song VALUES (38, 'everything i wanted', 2019, 'Pop', 'Single', 13, 8);
INSERT INTO Song VALUES (39, 'What Was I Made For?', 2023, 'Pop', 'Barbie Soundtrack', 13, 8);
INSERT INTO Song VALUES (40, 'ocean eyes', 2016, 'Pop', 'dont smile at me', 13, 8);

-- Ariana Grande (ArtistID 14)
INSERT INTO Song VALUES (41, 'thank u, next', 2019, 'Pop', 'thank u, next', 14, 10);
INSERT INTO Song VALUES (42, '7 rings', 2019, 'Pop', 'thank u, next', 14, 10);
INSERT INTO Song VALUES (43, 'positions', 2020, 'Pop', 'Positions', 14, 10);
INSERT INTO Song VALUES (44, 'Into You', 2016, 'Pop', 'Dangerous Woman', 14, 10);
INSERT INTO Song VALUES (45, 'Side to Side', 2016, 'Pop', 'Dangerous Woman', 14, 10);
INSERT INTO Song VALUES (46, 'we cant be friends', 2024, 'Pop', 'eternal sunshine', 14, 10);

-- Justin Bieber (ArtistID 15)
INSERT INTO Song VALUES (47, 'Peaches', 2021, 'Pop', 'Justice', 15, 11);
INSERT INTO Song VALUES (48, 'Sorry', 2015, 'Pop', 'Purpose', 15, 11);
INSERT INTO Song VALUES (49, 'Love Yourself', 2015, 'Pop', 'Purpose', 15, 11);
INSERT INTO Song VALUES (50, 'What Do You Mean?', 2015, 'Pop', 'Purpose', 15, 11);
INSERT INTO Song VALUES (51, 'Intentions', 2020, 'Pop', 'Changes', 15, 11);

-- Olivia Rodrigo (ArtistID 16)
INSERT INTO Song VALUES (52, 'drivers license', 2021, 'Pop', 'SOUR', 16, 7);
INSERT INTO Song VALUES (53, 'good 4 u', 2021, 'Pop', 'SOUR', 16, 7);
INSERT INTO Song VALUES (54, 'vampire', 2023, 'Pop', 'GUTS', 16, 7);
INSERT INTO Song VALUES (55, 'deja vu', 2021, 'Pop', 'SOUR', 16, 7);
INSERT INTO Song VALUES (56, 'get him back!', 2023, 'Pop', 'GUTS', 16, 7);

-- Shawn Mendes (ArtistID 17)
INSERT INTO Song VALUES (57, 'Señorita', 2019, 'Pop', 'Shawn Mendes', 17, 12);
INSERT INTO Song VALUES (58, 'Stitches', 2015, 'Pop', 'Handwritten', 17, 12);
INSERT INTO Song VALUES (59, 'Treat You Better', 2016, 'Pop', 'Illuminate', 17, 12);
INSERT INTO Song VALUES (60, 'There''s Nothing Holdin'' Me Back', 2017, 'Pop', 'Illuminate', 17, 12);

-- Post Malone (ArtistID 28)
INSERT INTO Song VALUES (61, 'Circles', 2019, 'Hip Hop', 'Hollywood''s Bleeding', 28, 10);
INSERT INTO Song VALUES (62, 'Sunflower', 2018, 'Hip Hop', 'Spider-Man', 28, 10);
INSERT INTO Song VALUES (63, 'Rockstar', 2017, 'Hip Hop', 'beerbongs & bentleys', 28, 10);
INSERT INTO Song VALUES (64, 'Better Now', 2018, 'Hip Hop', 'beerbongs & bentleys', 28, 10);
INSERT INTO Song VALUES (65, 'Congratulations', 2016, 'Hip Hop', 'Stoney', 28, 10);

-- Eminem (ArtistID 29)
INSERT INTO Song VALUES (66, 'Lose Yourself', 2002, 'Hip Hop', '8 Mile', 29, 8);
INSERT INTO Song VALUES (67, 'Without Me', 2002, 'Hip Hop', 'The Eminem Show', 29, 8);
INSERT INTO Song VALUES (68, 'Love The Way You Lie', 2010, 'Hip Hop', 'Recovery', 29, 8);
INSERT INTO Song VALUES (69, 'Stan', 2000, 'Hip Hop', 'The Marshall Mathers LP', 29, 8);
INSERT INTO Song VALUES (70, 'Rap God', 2013, 'Hip Hop', 'The Marshall Mathers LP 2', 29, 8);

-- Kendrick Lamar (ArtistID 30)
INSERT INTO Song VALUES (71, 'HUMBLE.', 2017, 'Hip Hop', 'DAMN.', 30, 8);
INSERT INTO Song VALUES (72, 'DNA.', 2017, 'Hip Hop', 'DAMN.', 30, 8);
INSERT INTO Song VALUES (73, 'Swimming Pools', 2012, 'Hip Hop', 'good kid, m.A.A.d city', 30, 8);
INSERT INTO Song VALUES (74, 'LOYALTY.', 2017, 'Hip Hop', 'DAMN.', 30, 8);
INSERT INTO Song VALUES (75, 'Alright', 2015, 'Hip Hop', 'To Pimp a Butterfly', 30, 8);

-- Capital Bra (ArtistID 38)
INSERT INTO Song VALUES (76, 'Cherry Lady', 2018, 'Hip Hop', 'Berlin lebt', 38, 18);
INSERT INTO Song VALUES (77, 'Neymar', 2018, 'Hip Hop', 'Berlin lebt 2', 38, 18);
INSERT INTO Song VALUES (78, 'One Night Stand', 2019, 'Hip Hop', 'CB6', 38, 18);
INSERT INTO Song VALUES (79, 'Prinzessa', 2019, 'Hip Hop', 'CB6', 38, 18);
INSERT INTO Song VALUES (80, 'Benzema', 2020, 'Hip Hop', 'CB7', 38, 18);

-- Apache 207 (ArtistID 39)
INSERT INTO Song VALUES (81, 'Roller', 2019, 'Hip Hop', 'Treppenhaus', 39, 19);
INSERT INTO Song VALUES (82, 'Kein Problem', 2019, 'Hip Hop', 'Treppenhaus', 39, 19);
INSERT INTO Song VALUES (83, 'Wieso tust Du dir das an', 2020, 'Hip Hop', 'Gartenstadt', 39, 19);
INSERT INTO Song VALUES (84, 'Bläulich', 2019, 'Hip Hop', 'Treppenhaus', 39, 19);
INSERT INTO Song VALUES (85, 'Fame', 2020, 'Hip Hop', 'Gartenstadt', 39, 19);

-- Bonez MC (ArtistID 40)
INSERT INTO Song VALUES (86, 'Ohne mein Team', 2016, 'Hip Hop', 'Palmen aus Plastik', 40, 19);
INSERT INTO Song VALUES (87, '500 PS', 2018, 'Hip Hop', 'Palmen aus Plastik 2', 40, 19);
INSERT INTO Song VALUES (88, 'Tilidin', 2018, 'Hip Hop', 'Palmen aus Plastik 2', 40, 19);
INSERT INTO Song VALUES (89, 'Shotz Fired', 2020, 'Hip Hop', 'Hollywood', 40, 19);

-- RAF Camora (ArtistID 41)
INSERT INTO Song VALUES (90, 'Andere Liga', 2016, 'Hip Hop', 'Anthrazit', 41, 19);
INSERT INTO Song VALUES (91, 'Primo', 2017, 'Hip Hop', 'Palmen aus Plastik', 41, 19);
INSERT INTO Song VALUES (92, 'Kontrollieren', 2020, 'Hip Hop', 'Zenit', 41, 19);
INSERT INTO Song VALUES (93, 'Alles probiert', 2018, 'Hip Hop', 'Anthrazit RR', 41, 19);

-- Bushido (ArtistID 42)
INSERT INTO Song VALUES (94, 'Alles verloren', 2008, 'Hip Hop', '7', 42, 2);
INSERT INTO Song VALUES (95, 'Für euch alle', 2005, 'Hip Hop', 'Electro Ghetto', 42, 2);
INSERT INTO Song VALUES (96, 'Janine', 2008, 'Hip Hop', 'Heavy Metal Payback', 42, 2);
INSERT INTO Song VALUES (97, 'Schmetterling', 2007, 'Hip Hop', 'Von der Skyline', 42, 2);

-- Shirin David (ArtistID 49)
INSERT INTO Song VALUES (98, 'Gib ihm', 2019, 'Pop', 'Supersize', 49, 1);
INSERT INTO Song VALUES (99, 'Ice', 2022, 'Pop', 'Bitches brauchen Rap', 49, 1);
INSERT INTO Song VALUES (100, 'Lieben wir', 2020, 'Pop', 'Supersize', 49, 1);
INSERT INTO Song VALUES (101, 'Ich darf das', 2021, 'Pop', 'Bitches brauchen Rap', 49, 1);

-- Mark Forster (ArtistID 51)
INSERT INTO Song VALUES (102, 'Chöre', 2014, 'Pop', 'Bauch und Kopf', 51, 2);
INSERT INTO Song VALUES (103, 'Au Revoir', 2016, 'Pop', 'TAPE', 51, 2);
INSERT INTO Song VALUES (104, 'Übermorgen', 2019, 'Pop', 'LIEBE', 51, 2);
INSERT INTO Song VALUES (105, 'Flash mich', 2012, 'Pop', 'Karton', 51, 2);

-- Max Giesinger (ArtistID 52)
INSERT INTO Song VALUES (106, '80 Millionen', 2016, 'Pop', 'Der Junge, der rennt', 52, 3);
INSERT INTO Song VALUES (107, 'Wenn sie tanzt', 2017, 'Pop', 'Der Junge, der rennt', 52, 3);
INSERT INTO Song VALUES (108, 'Die Reise', 2018, 'Pop', 'Die Reise', 52, 3);
INSERT INTO Song VALUES (109, 'Legenden', 2020, 'Pop', 'Irgendwann ist jetzt', 52, 3);

-- Wincent Weiss (ArtistID 53)
INSERT INTO Song VALUES (110, 'Feuerwerk', 2017, 'Pop', 'Irgendwas gegen die Stille', 53, 3);
INSERT INTO Song VALUES (111, 'Musik sein', 2016, 'Pop', 'Single', 53, 3);
INSERT INTO Song VALUES (112, 'An Wunder', 2018, 'Pop', 'Irgendwas gegen die Stille', 53, 3);
INSERT INTO Song VALUES (113, 'Frische Luft', 2019, 'Pop', 'Vielleicht Irgendwann', 53, 3);

-- Linkin Park (ArtistID 60)
INSERT INTO Song VALUES (114, 'In The End', 2000, 'Rock', 'Hybrid Theory', 60, 3);
INSERT INTO Song VALUES (115, 'Numb', 2003, 'Rock', 'Meteora', 60, 3);
INSERT INTO Song VALUES (116, 'What I''ve Done', 2007, 'Rock', 'Minutes to Midnight', 60, 3);
INSERT INTO Song VALUES (117, 'One Step Closer', 2000, 'Rock', 'Hybrid Theory', 60, 3);
INSERT INTO Song VALUES (118, 'Breaking The Habit', 2003, 'Rock', 'Meteora', 60, 3);

-- Imagine Dragons (ArtistID 27 & 61 - Duplikat eingebaut!)
INSERT INTO Song VALUES (119, 'Radioactive', 2012, 'Rock', 'Night Visions', 27, 8);
INSERT INTO Song VALUES (120, 'Believer', 2017, 'Rock', 'Evolve', 27, 8);
INSERT INTO Song VALUES (121, 'Thunder', 2017, 'Rock', 'Evolve', 61, 8); -- Fehler: anderer Artist
INSERT INTO Song VALUES (122, 'Demons', 2013, 'Rock', 'Night Visions', 27, 8);
INSERT INTO Song VALUES (123, 'Whatever It Takes', 2017, 'Rock', 'Evolve', 27, 8);

-- Arctic Monkeys (ArtistID 62)
INSERT INTO Song VALUES (124, 'Do I Wanna Know?', 2013, 'Rock', 'AM', 62, 16);
INSERT INTO Song VALUES (125, 'R U Mine?', 2012, 'Rock', 'AM', 62, 16);
INSERT INTO Song VALUES (126, 'Why''d You Only Call Me When You''re High?', 2013, 'Rock', 'AM', 62, 16);
INSERT INTO Song VALUES (127, 'I Bet You Look Good on the Dancefloor', 2005, 'Rock', 'Whatever', 62, 16);

-- Coldplay (weitere Songs)
INSERT INTO Song VALUES (128, 'The Scientist', 2002, 'Rock', 'A Rush of Blood', 9, 3);
INSERT INTO Song VALUES (129, 'Paradise', 2011, 'Rock', 'Mylo Xyloto', 9, 3);
INSERT INTO Song VALUES (130, 'A Sky Full of Stars', 2014, 'Rock', 'Ghost Stories', 9, 3);
INSERT INTO Song VALUES (131, 'Adventure of a Lifetime', 2015, 'Rock', 'A Head Full of Dreams', 9, 3);

-- David Guetta (ArtistID 71)
INSERT INTO Song VALUES (132, 'Titanium', 2011, 'Electronic', 'Nothing but the Beat', 71, 3);
INSERT INTO Song VALUES (133, 'When Love Takes Over', 2009, 'Electronic', 'One Love', 71, 3);
INSERT INTO Song VALUES (134, 'Memories', 2010, 'Electronic', 'One Love', 71, 3);
INSERT INTO Song VALUES (135, 'Without You', 2011, 'Electronic', 'Nothing but the Beat', 71, 3);

-- Calvin Harris (ArtistID 72)
INSERT INTO Song VALUES (136, 'Summer', 2014, 'Electronic', 'Motion', 72, 7);
INSERT INTO Song VALUES (137, 'Feel So Close', 2011, 'Electronic', '18 Months', 72, 7);
INSERT INTO Song VALUES (138, 'This Is What You Came For', 2016, 'Electronic', 'Single', 72, 7);
INSERT INTO Song VALUES (139, 'One Kiss', 2018, 'Electronic', 'Single', 72, 7);

-- Avicii (ArtistID 74)
INSERT INTO Song VALUES (140, 'Wake Me Up', 2013, 'Electronic', 'True', 74, 1);
INSERT INTO Song VALUES (141, 'Levels', 2011, 'Electronic', 'Single', 74, 1);
INSERT INTO Song VALUES (142, 'Hey Brother', 2013, 'Electronic', 'True', 74, 1);
INSERT INTO Song VALUES (143, 'Waiting For Love', 2015, 'Electronic', 'Stories', 74, 1);
INSERT INTO Song VALUES (144, 'The Nights', 2014, 'Electronic', 'The Days / Nights', 74, 1);

-- Robin Schulz (ArtistID 78)
INSERT INTO Song VALUES (145, 'Waves', 2014, 'Electronic', 'Prayer', 78, 3);
INSERT INTO Song VALUES (146, 'Sugar', 2015, 'Electronic', 'Sugar', 78, 3);
INSERT INTO Song VALUES (147, 'Headlights', 2015, 'Electronic', 'Sugar', 78, 3);
INSERT INTO Song VALUES (148, 'OK', 2017, 'Electronic', 'Uncovered', 78, 3);

-- Beyoncé (ArtistID 80)
INSERT INTO Song VALUES (149, 'Crazy in Love', 2003, 'R&B', 'Dangerously in Love', 80, 7);
INSERT INTO Song VALUES (150, 'Single Ladies', 2008, 'R&B', 'I Am... Sasha Fierce', 80, 7);
INSERT INTO Song VALUES (151, 'Halo', 2008, 'R&B', 'I Am... Sasha Fierce', 80, 7);
INSERT INTO Song VALUES (152, 'Formation', 2016, 'R&B', 'Lemonade', 80, 7);
INSERT INTO Song VALUES (153, 'TEXAS HOLD ''EM', 2024, 'Country', 'Cowboy Carter', 80, 7);

-- Rihanna (ArtistID 81)
INSERT INTO Song VALUES (154, 'Umbrella', 2007, 'Pop', 'Good Girl Gone Bad', 81, 11);
INSERT INTO Song VALUES (155, 'Diamonds', 2012, 'Pop', 'Unapologetic', 81, 11);
INSERT INTO Song VALUES (156, 'Work', 2016, 'Pop', 'Anti', 81, 11);
INSERT INTO Song VALUES (157, 'We Found Love', 2011, 'Pop', 'Talk That Talk', 81, 11);
INSERT INTO Song VALUES (158, 'Stay', 2012, 'Pop', 'Unapologetic', 81, 11);

-- Lady Gaga (ArtistID 22)
INSERT INTO Song VALUES (159, 'Poker Face', 2008, 'Pop', 'The Fame', 22, 8);
INSERT INTO Song VALUES (160, 'Bad Romance', 2009, 'Pop', 'The Fame Monster', 22, 8);
INSERT INTO Song VALUES (161, 'Shallow', 2018, 'Pop', 'A Star Is Born', 22, 8);
INSERT INTO Song VALUES (162, 'Born This Way', 2011, 'Pop', 'Born This Way', 22, 8);
INSERT INTO Song VALUES (163, 'Paparazzi', 2009, 'Pop', 'The Fame', 22, 8);

-- Bruno Mars (ArtistID 23)
INSERT INTO Song VALUES (164, 'Uptown Funk', 2014, 'Pop', 'Uptown Special', 23, 6);
INSERT INTO Song VALUES (165, 'Just The Way You Are', 2010, 'Pop', 'Doo-Wops & Hooligans', 23, 6);
INSERT INTO Song VALUES (166, 'Locked Out of Heaven', 2012, 'Pop', 'Unorthodox Jukebox', 23, 6);
INSERT INTO Song VALUES (167, 'Treasure', 2013, 'Pop', 'Unorthodox Jukebox', 23, 6);
INSERT INTO Song VALUES (168, '24K Magic', 2016, 'Pop', '24K Magic', 23, 6);

-- Maroon 5 (ArtistID 26)
INSERT INTO Song VALUES (169, 'Moves Like Jagger', 2011, 'Pop', 'Hands All Over', 26, 8);
INSERT INTO Song VALUES (170, 'Sugar', 2014, 'Pop', 'V', 26, 8);
INSERT INTO Song VALUES (171, 'Girls Like You', 2018, 'Pop', 'Red Pill Blues', 26, 8);
INSERT INTO Song VALUES (172, 'Payphone', 2012, 'Pop', 'Overexposed', 26, 8);
INSERT INTO Song VALUES (173, 'Animals', 2014, 'Pop', 'V', 26, 8);

-- OneRepublic (ArtistID 25)
INSERT INTO Song VALUES (174, 'Counting Stars', 2013, 'Pop', 'Native', 25, 8);
INSERT INTO Song VALUES (175, 'Apologize', 2007, 'Pop', 'Dreaming Out Loud', 25, 8);
INSERT INTO Song VALUES (176, 'Secrets', 2009, 'Pop', 'Waking Up', 25, 8);
INSERT INTO Song VALUES (177, 'Good Life', 2010, 'Pop', 'Waking Up', 25, 8);

-- Katy Perry (ArtistID 21)
INSERT INTO Song VALUES (178, 'Firework', 2010, 'Pop', 'Teenage Dream', 21, 9);
INSERT INTO Song VALUES (179, 'Roar', 2013, 'Pop', 'Prism', 21, 9);
INSERT INTO Song VALUES (180, 'Dark Horse', 2013, 'Pop', 'Prism', 21, 9);
INSERT INTO Song VALUES (181, 'California Gurls', 2010, 'Pop', 'Teenage Dream', 21, 9);
INSERT INTO Song VALUES (182, 'Hot N Cold', 2008, 'Pop', 'One of the Boys', 21, 9);

-- Lana Del Rey (ArtistID 91)
INSERT INTO Song VALUES (183, 'Summertime Sadness', 2012, 'Indie', 'Born to Die', 91, 8);
INSERT INTO Song VALUES (184, 'Video Games', 2011, 'Indie', 'Born to Die', 91, 8);
INSERT INTO Song VALUES (185, 'Young and Beautiful', 2013, 'Indie', 'The Great Gatsby', 91, 8);
INSERT INTO Song VALUES (186, 'Born to Die', 2011, 'Indie', 'Born to Die', 91, 8);

-- Sam Smith (ArtistID 88)
INSERT INTO Song VALUES (187, 'Stay With Me', 2014, 'Soul', 'In the Lonely Hour', 88, 9);
INSERT INTO Song VALUES (188, 'Too Good at Goodbyes', 2017, 'Pop', 'The Thrill of It All', 88, 9);
INSERT INTO Song VALUES (189, 'Unholy', 2022, 'Pop', 'Gloria', 88, 9);
INSERT INTO Song VALUES (190, 'Im Not the Only One', 2014, 'Soul', 'In the Lonely Hour', 88, 9);

-- Lewis Capaldi (ArtistID 89)
INSERT INTO Song VALUES (191, 'Someone You Loved', 2018, 'Pop', 'Divinely Uninspired', 89, 16);
INSERT INTO Song VALUES (192, 'Before You Go', 2019, 'Pop', 'Divinely Uninspired', 89, 16);
INSERT INTO Song VALUES (193, 'Forget Me', 2023, 'Pop', 'Broken By Desire', 89, 16);

-- Selena Gomez (ArtistID 18)
INSERT INTO Song VALUES (194, 'Lose You to Love Me', 2019, 'Pop', 'Rare', 18, 8);
INSERT INTO Song VALUES (195, 'Good for You', 2015, 'Pop', 'Revival', 18, 8);
INSERT INTO Song VALUES (196, 'Hands to Myself', 2015, 'Pop', 'Revival', 18, 8);
INSERT INTO Song VALUES (197, 'Come & Get It', 2013, 'Pop', 'Stars Dance', 18, 12); -- Fehler: falsches Label

-- Camila Cabello (ArtistID 19)
INSERT INTO Song VALUES (198, 'Havana', 2017, 'Pop', 'Camila', 19, 15);
INSERT INTO Song VALUES (199, 'Señorita', 2019, 'Pop', 'Romance', 19, 15);
INSERT INTO Song VALUES (200, 'Never Be the Same', 2017, 'Pop', 'Camila', 19, 15);

-- Miley Cyrus (ArtistID 20)
INSERT INTO Song VALUES (201, 'Wrecking Ball', 2013, 'Pop', 'Bangerz', 20, 7);
INSERT INTO Song VALUES (202, 'Flowers', 2023, 'Pop', 'Endless Summer Vacation', 20, 7);
INSERT INTO Song VALUES (203, 'Party in the U.S.A.', 2009, 'Pop', 'The Time of Our Lives', 20, 12); -- Fehler: falsches Label
INSERT INTO Song VALUES (204, 'Malibu', 2017, 'Pop', 'Younger Now', 20, 7);

-- The Chainsmokers (ArtistID 24)
INSERT INTO Song VALUES (205, 'Closer', 2016, 'Electronic', 'Collage', 24, 7);
INSERT INTO Song VALUES (206, 'Don''t Let Me Down', 2016, 'Electronic', 'Collage', 24, 7);
INSERT INTO Song VALUES (207, 'Something Just Like This', 2017, 'Electronic', 'Memories', 24, 7);
INSERT INTO Song VALUES (208, 'Paris', 2017, 'Electronic', 'Memories', 24, 7);

-- Kanye West (ArtistID 32)
INSERT INTO Song VALUES (209, 'Stronger', 2007, 'Hip Hop', 'Graduation', 32, 11);
INSERT INTO Song VALUES (210, 'Gold Digger', 2005, 'Hip Hop', 'Late Registration', 32, 11);
INSERT INTO Song VALUES (211, 'Heartless', 2008, 'Hip Hop', '808s & Heartbreak', 32, 11);
INSERT INTO Song VALUES (212, 'Power', 2010, 'Hip Hop', 'My Beautiful Dark Twisted Fantasy', 32, 11);

-- Nicki Minaj (ArtistID 33)
INSERT INTO Song VALUES (213, 'Super Bass', 2011, 'Hip Hop', 'Pink Friday', 33, 10);
INSERT INTO Song VALUES (214, 'Anaconda', 2014, 'Hip Hop', 'The Pinkprint', 33, 10);
INSERT INTO Song VALUES (215, 'Starships', 2012, 'Hip Hop', 'Pink Friday: Roman Reloaded', 33, 10);

-- Cardi B (ArtistID 34)
INSERT INTO Song VALUES (216, 'Bodak Yellow', 2017, 'Hip Hop', 'Invasion of Privacy', 34, 6);
INSERT INTO Song VALUES (217, 'I Like It', 2018, 'Hip Hop', 'Invasion of Privacy', 34, 6);
INSERT INTO Song VALUES (218, 'WAP', 2020, 'Hip Hop', 'Single', 34, 6);

-- Lil Nas X (ArtistID 35)
INSERT INTO Song VALUES (219, 'Old Town Road', 2019, 'Hip Hop', '7', 35, 7);
INSERT INTO Song VALUES (220, 'Montero', 2021, 'Hip Hop', 'Montero', 35, 7);
INSERT INTO Song VALUES (221, 'Industry Baby', 2021, 'Hip Hop', 'Montero', 35, 7);

-- J. Cole (ArtistID 31)
INSERT INTO Song VALUES (222, 'No Role Modelz', 2014, 'Hip Hop', '2014 Forest Hills Drive', 31, 10);
INSERT INTO Song VALUES (223, 'Middle Child', 2019, 'Hip Hop', 'Single', 31, 10);
INSERT INTO Song VALUES (224, 'Love Yourz', 2014, 'Hip Hop', '2014 Forest Hills Drive', 31, 10);

-- Luciano (ArtistID 47)
INSERT INTO Song VALUES (225, 'Majestic', 2019, 'Hip Hop', 'Eiskalt', 47, 10);
INSERT INTO Song VALUES (226, 'Vorankommen', 2020, 'Hip Hop', 'Millies', 47, 10);
INSERT INTO Song VALUES (227, 'Mörder', 2018, 'Hip Hop', 'L.O.C.O.', 47, 10);

-- Kollegah (ArtistID 43)
INSERT INTO Song VALUES (228, 'Legacy', 2014, 'Hip Hop', 'King', 43, 1);
INSERT INTO Song VALUES (229, 'Apokalypse', 2014, 'Hip Hop', 'King', 43, 1);
INSERT INTO Song VALUES (230, 'Rotlicht', 2013, 'Hip Hop', 'Jung, brutal, gutaussehend', 43, 1);

-- Haftbefehl (ArtistID 45)
INSERT INTO Song VALUES (231, 'Chabos wissen wer der Babo ist', 2012, 'Hip Hop', 'Blockplatin', 45, 20);
INSERT INTO Song VALUES (232, 'Ihr Hurensöhne', 2014, 'Hip Hop', 'Blockplatin', 45, 20);
INSERT INTO Song VALUES (233, 'Saudi Arabi Money Rich', 2018, 'Hip Hop', 'Russisch Roulette', 45, 20);

-- Loredana (ArtistID 48)
INSERT INTO Song VALUES (234, 'Bonnie & Clyde', 2018, 'Hip Hop', 'Milliondollar$mile', 48, 16);
INSERT INTO Song VALUES (235, 'Eiskalt', 2019, 'Hip Hop', 'King Lori', 48, 16);
INSERT INTO Song VALUES (236, 'Jetzt rufst du an', 2019, 'Hip Hop', 'King Lori', 48, 16);

-- Samra (ArtistID 50)
INSERT INTO Song VALUES (237, 'Cataleya', 2018, 'Hip Hop', 'Cataleya', 50, 10);
INSERT INTO Song VALUES (238, 'Wieder Lila', 2019, 'Hip Hop', 'Rohdiamant', 50, 10);
INSERT INTO Song VALUES (239, 'Huracan', 2020, 'Hip Hop', 'Single', 50, 10);

-- Sarah Connor (ArtistID 54)
INSERT INTO Song VALUES (240, 'Wie schön du bist', 2015, 'Pop', 'Muttersprache', 54, 13);
INSERT INTO Song VALUES (241, 'Vincent', 2019, 'Pop', 'Herz Kraft Werke', 54, 13);
INSERT INTO Song VALUES (242, 'From Sarah with Love', 2001, 'Pop', 'Green Eyed Soul', 54, 13);

-- Andreas Bourani (ArtistID 56)
INSERT INTO Song VALUES (243, 'Auf uns', 2014, 'Pop', 'Hey', 56, 3);
INSERT INTO Song VALUES (244, 'Auf anderen Wegen', 2011, 'Pop', 'Staub und Fantasie', 56, 3);
INSERT INTO Song VALUES (245, 'Ein Hoch auf uns', 2014, 'Pop', 'Hey', 56, 3); -- Doppelt mit 243!

-- Lena (ArtistID 57)
INSERT INTO Song VALUES (246, 'Satellite', 2010, 'Pop', 'My Cassette Player', 57, 1);
INSERT INTO Song VALUES (247, 'Traffic Lights', 2011, 'Pop', 'Good News', 57, 1);
INSERT INTO Song VALUES (248, 'Strip', 2020, 'Pop', 'Only Love, L', 57, 1);

-- Tim Bendzko (ArtistID 59)
INSERT INTO Song VALUES (249, 'Nur noch kurz die Welt retten', 2011, 'Pop', 'Wenn Worte meine Sprache wären', 59, 2);
INSERT INTO Song VALUES (250, 'Hoch', 2013, 'Pop', 'Am seidenen Faden', 59, 2);
INSERT INTO Song VALUES (251, 'Leben', 2017, 'Pop', 'Filter', 59, 2);

-- Revolverheld (ArtistID 58)
INSERT INTO Song VALUES (252, 'Ich lass für dich das Licht an', 2010, 'Rock', 'In Farbe', 58, 2);
INSERT INTO Song VALUES (253, 'Spinner', 2013, 'Rock', 'MTV Unplugged', 58, 2);
INSERT INTO Song VALUES (254, 'Das kann uns keiner nehmen', 2014, 'Rock', 'MTV Unplugged', 58, 2);

-- Red Hot Chili Peppers (ArtistID 67)
INSERT INTO Song VALUES (255, 'Californication', 1999, 'Rock', 'Californication', 67, 3);
INSERT INTO Song VALUES (256, 'Under the Bridge', 1991, 'Rock', 'Blood Sugar Sex Magik', 67, 3);
INSERT INTO Song VALUES (257, 'Scar Tissue', 1999, 'Rock', 'Californication', 67, 3);
INSERT INTO Song VALUES (258, 'Otherside', 1999, 'Rock', 'Californication', 67, 3);

-- Green Day (ArtistID 65)
INSERT INTO Song VALUES (259, 'Boulevard of Broken Dreams', 2004, 'Rock', 'American Idiot', 65, 10);
INSERT INTO Song VALUES (260, 'American Idiot', 2004, 'Rock', 'American Idiot', 65, 10);
INSERT INTO Song VALUES (261, 'Wake Me Up When September Ends', 2004, 'Rock', 'American Idiot', 65, 10);
INSERT INTO Song VALUES (262, 'Basket Case', 1994, 'Rock', 'Dookie', 65, 10);

-- Foo Fighters (ArtistID 66)
INSERT INTO Song VALUES (263, 'Everlong', 1997, 'Rock', 'The Colour and the Shape', 66, 14);
INSERT INTO Song VALUES (264, 'Best of You', 2005, 'Rock', 'In Your Honor', 66, 14);
INSERT INTO Song VALUES (265, 'The Pretender', 2007, 'Rock', 'Echoes, Silence, Patience', 66, 14);
INSERT INTO Song VALUES (266, 'Learn to Fly', 1999, 'Rock', 'There Is Nothing Left to Lose', 66, 14);

-- Muse (ArtistID 64)
INSERT INTO Song VALUES (267, 'Supermassive Black Hole', 2006, 'Rock', 'Black Holes and Revelations', 64, 3);
INSERT INTO Song VALUES (268, 'Uprising', 2009, 'Rock', 'The Resistance', 64, 3);
INSERT INTO Song VALUES (269, 'Starlight', 2006, 'Rock', 'Black Holes and Revelations', 64, 3);
INSERT INTO Song VALUES (270, 'Time Is Running Out', 2003, 'Rock', 'Absolution', 64, 3);

-- The Killers (ArtistID 63)
INSERT INTO Song VALUES (271, 'Mr. Brightside', 2003, 'Rock', 'Hot Fuss', 63, 12);
INSERT INTO Song VALUES (272, 'Somebody Told Me', 2004, 'Rock', 'Hot Fuss', 63, 12);
INSERT INTO Song VALUES (273, 'Human', 2008, 'Rock', 'Day & Age', 63, 12);
INSERT INTO Song VALUES (274, 'When You Were Young', 2006, 'Rock', 'Sam''s Town', 63, 12);

-- Nirvana (ArtistID 68)
INSERT INTO Song VALUES (275, 'Smells Like Teen Spirit', 1991, 'Rock', 'Nevermind', 68, 11);
INSERT INTO Song VALUES (276, 'Come as You Are', 1991, 'Rock', 'Nevermind', 68, 11);
INSERT INTO Song VALUES (277, 'Lithium', 1991, 'Rock', 'Nevermind', 68, 11);
INSERT INTO Song VALUES (278, 'Heart-Shaped Box', 1993, 'Rock', 'In Utero', 68, 11);

-- The Beatles (ArtistID 69)
INSERT INTO Song VALUES (279, 'Hey Jude', 1968, 'Rock', 'Single', 69, 17);
INSERT INTO Song VALUES (280, 'Let It Be', 1970, 'Rock', 'Let It Be', 69, 17);
INSERT INTO Song VALUES (281, 'Yesterday', 1965, 'Rock', 'Help!', 69, 17);
INSERT INTO Song VALUES (282, 'Come Together', 1969, 'Rock', 'Abbey Road', 69, 17);
INSERT INTO Song VALUES (283, 'Here Comes the Sun', 1969, 'Rock', 'Abbey Road', 69, 17);

-- Queen (ArtistID 70)
INSERT INTO Song VALUES (284, 'Bohemian Rhapsody', 1975, 'Rock', 'A Night at the Opera', 70, 12);
INSERT INTO Song VALUES (285, 'We Will Rock You', 1977, 'Rock', 'News of the World', 70, 12);
INSERT INTO Song VALUES (286, 'We Are the Champions', 1977, 'Rock', 'News of the World', 70, 12);
INSERT INTO Song VALUES (287, 'Somebody to Love', 1976, 'Rock', 'A Day at the Races', 70, 12);
INSERT INTO Song VALUES (288, 'Don''t Stop Me Now', 1978, 'Rock', 'Jazz', 70, 12);

-- Martin Garrix (ArtistID 73)
INSERT INTO Song VALUES (289, 'Animals', 2013, 'Electronic', 'Single', 73, 2);
INSERT INTO Song VALUES (290, 'Scared to Be Lonely', 2017, 'Electronic', 'Single', 73, 2);
INSERT INTO Song VALUES (291, 'In the Name of Love', 2016, 'Electronic', 'Single', 73, 2);

-- Marshmello (ArtistID 75)
INSERT INTO Song VALUES (292, 'Happier', 2018, 'Electronic', 'Single', 75, 10);
INSERT INTO Song VALUES (293, 'Alone', 2016, 'Electronic', 'Joytime', 75, 10);
INSERT INTO Song VALUES (294, 'Silence', 2017, 'Electronic', 'Single', 75, 10);

-- Daft Punk (ArtistID 76)
INSERT INTO Song VALUES (295, 'Get Lucky', 2013, 'Electronic', 'Random Access Memories', 76, 7);
INSERT INTO Song VALUES (296, 'One More Time', 2000, 'Electronic', 'Discovery', 76, 7);
INSERT INTO Song VALUES (297, 'Harder, Better, Faster, Stronger', 2001, 'Electronic', 'Discovery', 76, 7);

-- Felix Jaehn (ArtistID 79)
INSERT INTO Song VALUES (298, 'Aint Nobody', 2015, 'Electronic', 'I', 79, 1);
INSERT INTO Song VALUES (299, 'Cheerleader', 2015, 'Electronic', 'Single', 79, 1);
INSERT INTO Song VALUES (300, 'Book of Love', 2016, 'Electronic', 'I', 79, 1);

-- SZA (ArtistID 82)
INSERT INTO Song VALUES (301, 'Kill Bill', 2022, 'R&B', 'SOS', 82, 14);
INSERT INTO Song VALUES (302, 'Good Days', 2020, 'R&B', 'Single', 82, 14);
INSERT INTO Song VALUES (303, 'The Weekend', 2017, 'R&B', 'Ctrl', 82, 14);

-- H.E.R. (ArtistID 84)
INSERT INTO Song VALUES (304, 'Focus', 2017, 'R&B', 'H.E.R.', 84, 14);
INSERT INTO Song VALUES (305, 'Best Part', 2017, 'R&B', 'H.E.R.', 84, 14);
INSERT INTO Song VALUES (306, 'Damage', 2020, 'R&B', 'Back of My Mind', 84, 14);

-- Khalid (ArtistID 85)
INSERT INTO Song VALUES (307, 'Location', 2016, 'R&B', 'American Teen', 85, 14);
INSERT INTO Song VALUES (308, 'Young Dumb & Broke', 2017, 'R&B', 'American Teen', 85, 14);
INSERT INTO Song VALUES (309, 'Better', 2018, 'R&B', 'Suncity', 85, 14);

-- Hozier (ArtistID 95)
INSERT INTO Song VALUES (310, 'Take Me to Church', 2013, 'Indie', 'Hozier', 95, 7);
INSERT INTO Song VALUES (311, 'Someone New', 2014, 'Indie', 'Hozier', 95, 7);
INSERT INTO Song VALUES (312, 'Too Sweet', 2024, 'Indie', 'Unreal Unearth', 95, 7);

-- Glass Animals (ArtistID 93)
INSERT INTO Song VALUES (313, 'Heat Waves', 2020, 'Indie', 'Dreamland', 93, 13);
INSERT INTO Song VALUES (314, 'Gooey', 2014, 'Indie', 'Zaba', 93, 13);
INSERT INTO Song VALUES (315, 'The Other Side of Paradise', 2016, 'Indie', 'How to Be a Human Being', 93, 13);

-- Tame Impala (ArtistID 92)
INSERT INTO Song VALUES (316, 'The Less I Know the Better', 2015, 'Indie', 'Currents', 92, 8);
INSERT INTO Song VALUES (317, 'Let It Happen', 2015, 'Indie', 'Currents', 92, 8);
INSERT INTO Song VALUES (318, 'Feels Like We Only Go Backwards', 2012, 'Indie', 'Lonerism', 92, 8);

-- Morgan Wallen (ArtistID 86)
INSERT INTO Song VALUES (319, 'Last Night', 2023, 'Country', 'One Thing at a Time', 86, 10);
INSERT INTO Song VALUES (320, 'Wasted on You', 2020, 'Country', 'Dangerous', 86, 10);
INSERT INTO Song VALUES (321, 'Whiskey Glasses', 2018, 'Country', 'If I Know Me', 86, 10);

-- Luke Combs (ArtistID 87)
INSERT INTO Song VALUES (322, 'Fast Car', 2023, 'Country', 'Gettin'' Old', 87, 7);
INSERT INTO Song VALUES (323, 'When It Rains It Pours', 2017, 'Country', 'This One''s for You', 87, 7);
INSERT INTO Song VALUES (324, 'Beautiful Crazy', 2018, 'Country', 'This One''s for You', 87, 7);

-- Bad Bunny (ArtistID 96)
INSERT INTO Song VALUES (325, 'Tití Me Preguntó', 2022, 'Reggaeton', 'Un Verano Sin Ti', 96, 14);
INSERT INTO Song VALUES (326, 'Callaíta', 2019, 'Reggaeton', 'Single', 96, 14);
INSERT INTO Song VALUES (327, 'Yo Perreo Sola', 2020, 'Reggaeton', 'YHLQMDLG', 96, 14);

-- Rosalía (ArtistID 97)
INSERT INTO Song VALUES (328, 'MALAMENTE', 2018, 'Flamenco Pop', 'El Mal Querer', 97, 7);
INSERT INTO Song VALUES (329, 'Con Altura', 2019, 'Reggaeton', 'Single', 97, 7);
INSERT INTO Song VALUES (330, 'LA FAMA', 2021, 'Pop', 'Motomami', 97, 7);

-- BTS (ArtistID 98)
INSERT INTO Song VALUES (331, 'Dynamite', 2020, 'K-Pop', 'BE', 98, 7);
INSERT INTO Song VALUES (332, 'Butter', 2021, 'K-Pop', 'Single', 98, 7);
INSERT INTO Song VALUES (333, 'Boy With Luv', 2019, 'K-Pop', 'Map of the Soul: Persona', 98, 7);

-- BlackPink (ArtistID 99)
INSERT INTO Song VALUES (334, 'Pink Venom', 2022, 'K-Pop', 'Born Pink', 99, 12);
INSERT INTO Song VALUES (335, 'Shut Down', 2022, 'K-Pop', 'Born Pink', 99, 12);
INSERT INTO Song VALUES (336, 'How You Like That', 2020, 'K-Pop', 'The Album', 99, 12);

-- Stray Kids (ArtistID 100)
INSERT INTO Song VALUES (337, 'God''s Menu', 2020, 'K-Pop', 'GO生', 100, 10);
INSERT INTO Song VALUES (338, 'MANIAC', 2022, 'K-Pop', 'ODDINARY', 100, 10);
INSERT INTO Song VALUES (339, 'Back Door', 2020, 'K-Pop', 'IN生', 100, 10);

-- Weitere Songs für bestehende Artists (Auffüllen auf 500)
-- Taylor Swift (weitere)
INSERT INTO Song VALUES (340, 'Shake It Off', 2014, 'Pop', '1989', 1, 1);
INSERT INTO Song VALUES (341, 'Love Story', 2008, 'Country', 'Fearless', 1, 1);
INSERT INTO Song VALUES (342, 'You Belong With Me', 2008, 'Country', 'Fearless', 1, 1);
INSERT INTO Song VALUES (343, 'Wildest Dreams', 2014, 'Pop', '1989', 1, 1);

-- The Weeknd (weitere)
INSERT INTO Song VALUES (344, 'The Hills', 2015, 'R&B', 'Beauty Behind the Madness', 2, 1);
INSERT INTO Song VALUES (345, 'Cant Feel My Face', 2015, 'Pop', 'Beauty Behind the Madness', 2, 1);
INSERT INTO Song VALUES (346, 'Die For You', 2016, 'R&B', 'Starboy', 2, 1);

-- Drake (weitere)
INSERT INTO Song VALUES (347, 'Hotline Bling', 2015, 'Hip Hop', 'Views', 3, 1);
INSERT INTO Song VALUES (348, 'In My Feelings', 2018, 'Hip Hop', 'Scorpion', 3, 1);
INSERT INTO Song VALUES (349, 'Nice For What', 2018, 'Hip Hop', 'Scorpion', 3, 1);
INSERT INTO Song VALUES (350, 'Toosie Slide', 2020, 'Hip Hop', 'Dark Lane Demo Tapes', 3, 1);

-- Adele (weitere)
INSERT INTO Song VALUES (351, 'Someone Like You', 2011, 'Soul', '21', 4, 2);
INSERT INTO Song VALUES (352, 'Set Fire to the Rain', 2011, 'Soul', '21', 4, 2);
INSERT INTO Song VALUES (353, 'Skyfall', 2012, 'Soul', 'Single', 4, 2);

-- Travis Scott (weitere)
INSERT INTO Song VALUES (354, 'Antidote', 2015, 'Hip Hop', 'Rodeo', 5, 2);
INSERT INTO Song VALUES (355, 'Highest in the Room', 2019, 'Hip Hop', 'Single', 5, 2);
INSERT INTO Song VALUES (356, 'FE!N', 2023, 'Hip Hop', 'Utopia', 5, 2);

-- Harry Styles (weitere)
INSERT INTO Song VALUES (357, 'Sign of the Times', 2017, 'Rock', 'Harry Styles', 6, 2);
INSERT INTO Song VALUES (358, 'Adore You', 2019, 'Pop', 'Fine Line', 6, 2);
INSERT INTO Song VALUES (359, 'Golden', 2019, 'Pop', 'Fine Line', 6, 2);

-- Ed Sheeran (weitere)
INSERT INTO Song VALUES (360, 'Thinking Out Loud', 2014, 'Pop', 'X', 7, 3);
INSERT INTO Song VALUES (361, 'Photograph', 2014, 'Pop', 'X', 7, 3);
INSERT INTO Song VALUES (362, 'Castle on the Hill', 2017, 'Pop', 'Divide', 7, 3);
INSERT INTO Song VALUES (363, 'Shivers', 2021, 'Pop', 'Equals', 7, 3);

-- Dua Lipa (weitere)
INSERT INTO Song VALUES (364, 'New Rules', 2017, 'Pop', 'Dua Lipa', 8, 3);
INSERT INTO Song VALUES (365, 'IDGAF', 2018, 'Pop', 'Dua Lipa', 8, 3);
INSERT INTO Song VALUES (366, 'Physical', 2020, 'Pop', 'Future Nostalgia', 8, 3);
INSERT INTO Song VALUES (367, 'Break My Heart', 2020, 'Pop', 'Future Nostalgia', 8, 3);

-- Peter Fox (weitere)
INSERT INTO Song VALUES (368, 'Alles neu', 2008, 'Hip Hop', 'Stadtaffe', 11, 3);
INSERT INTO Song VALUES (369, 'Schüttel deinen Speck', 2008, 'Hip Hop', 'Stadtaffe', 11, 3);

-- Radiohead (weitere)
INSERT INTO Song VALUES (370, 'Fake Plastic Trees', 1995, 'Rock', 'The Bends', 12, 5);
INSERT INTO Song VALUES (371, 'Street Spirit', 1995, 'Rock', 'The Bends', 12, 5);
INSERT INTO Song VALUES (372, 'Pyramid Song', 2001, 'Rock', 'Amnesiac', 12, 5);

-- Sido (weitere)
INSERT INTO Song VALUES (373, 'Astronaut', 2015, 'Hip Hop', 'Ich & keine Maske', 10, 1); -- Label-Wechsel
INSERT INTO Song VALUES (374, 'Tausend Tattoos', 2013, 'Hip Hop', '30-11-80', 10, 1);
INSERT INTO Song VALUES (375, 'Ackan', 2006, 'Hip Hop', 'Ich', 10, 4);

-- Weitere Songs verschiedener Artists für Diversität
INSERT INTO Song VALUES (376, 'Blurred Lines', 2013, 'Pop', 'Blurred Lines', 23, 6); -- Fehler: falscher Artist (Bruno Mars statt Robin Thicke)
INSERT INTO Song VALUES (377, 'Lean On', 2015, 'Electronic', 'Peace Is the Mission', 73, 2); -- Fehler: Martin Garrix statt Major Lazer
INSERT INTO Song VALUES (378, 'Despacito', 2017, 'Reggaeton', 'Vida', 96, 1); -- Fehler: Bad Bunny statt Luis Fonsi
INSERT INTO Song VALUES (379, 'Shape of You Remix', 2017, 'Pop', 'Divide', 7, 3);
INSERT INTO Song VALUES (380, 'Thunder', 2017, 'Rock', 'Evolve', 27, 8);

-- Mehr Songs für Deutschrap
INSERT INTO Song VALUES (381, 'M.W.G.', 2015, 'Hip Hop', 'Du bist Boss', 38, 18);
INSERT INTO Song VALUES (382, '200 km/h', 2019, 'Hip Hop', 'Treppenhaus', 39, 19);
INSERT INTO Song VALUES (383, 'Narben', 2020, 'Hip Hop', 'Single', 40, 19);
INSERT INTO Song VALUES (384, 'Risiko', 2017, 'Hip Hop', 'Anthrazit RR', 41, 19);
INSERT INTO Song VALUES (385, 'Chill dein Leben', 2011, 'Hip Hop', 'Blockplatin', 45, 20);

-- Helene Fischer (die fehlte noch komplett!)
INSERT INTO Song VALUES (386, 'Atemlos durch die Nacht', 2013, 'Schlager', 'Farbenspiel', 55, 13);
INSERT INTO Song VALUES (387, 'Herzbeben', 2013, 'Schlager', 'Farbenspiel', 55, 13);
INSERT INTO Song VALUES (388, 'Fehlerfrei', 2013, 'Schlager', 'Farbenspiel', 55, 13);

-- Mehr elektronische Musik
INSERT INTO Song VALUES (389, 'Don''t You Worry Child', 2012, 'Electronic', 'Until Now', 77, 10);
INSERT INTO Song VALUES (390, 'Save the World', 2011, 'Electronic', 'Until One', 77, 10);
INSERT INTO Song VALUES (391, 'Greyhound', 2012, 'Electronic', 'Until Now', 77, 10);

-- Frank Ocean (fehlte komplett)
INSERT INTO Song VALUES (392, 'Thinkin Bout You', 2012, 'R&B', 'Channel Orange', 83, 11);
INSERT INTO Song VALUES (393, 'Nights', 2016, 'R&B', 'Blonde', 83, 11);
INSERT INTO Song VALUES (394, 'Pink + White', 2016, 'R&B', 'Blonde', 83, 11);

-- Lauv (fehlte)
INSERT INTO Song VALUES (395, 'I Like Me Better', 2017, 'Pop', 'I met you when I was 18', 90, 6);
INSERT INTO Song VALUES (396, 'fuck, i''m lonely', 2019, 'Pop', 'how i''m feeling', 90, 6);

-- alt-J (fehlte)
INSERT INTO Song VALUES (397, 'Breezeblocks', 2012, 'Indie', 'An Awesome Wave', 94, 6);
INSERT INTO Song VALUES (398, 'Left Hand Free', 2014, 'Indie', 'This Is All Yours', 94, 6);

-- Megan Thee Stallion (fehlte fast)
INSERT INTO Song VALUES (399, 'Savage', 2020, 'Hip Hop', 'Suga', 37, 3);
INSERT INTO Song VALUES (400, 'Hot Girl Summer', 2019, 'Hip Hop', 'Single', 37, 3);
INSERT INTO Song VALUES (401, 'WAP', 2020, 'Hip Hop', 'Single', 37, 3);

-- 21 Savage (fehlte)
INSERT INTO Song VALUES (402, 'Bank Account', 2017, 'Hip Hop', 'Issa Album', 36, 15);
INSERT INTO Song VALUES (403, 'a lot', 2018, 'Hip Hop', 'i am > i was', 36, 15);

-- Farid Bang (fehlte)
INSERT INTO Song VALUES (404, 'Banger und Boss', 2013, 'Hip Hop', 'Banger leben kürzer', 44, 18);
INSERT INTO Song VALUES (405, 'Es war einmal', 2010, 'Hip Hop', 'Asphalt Massaka 2', 44, 18);

-- Fler (fehlte)
INSERT INTO Song VALUES (406, 'NDW 2005', 2005, 'Hip Hop', 'Neue Deutsche Welle', 46, 1);
INSERT INTO Song VALUES (407, 'Nie an mich geglaubt', 2008, 'Hip Hop', 'Fler', 46, 1);

-- Auffüllen bis 500 mit Mix aus allen Genres
INSERT INTO Song VALUES (408, 'Stairway to Heaven', 1971, 'Rock', 'Led Zeppelin IV', 70, 6); -- Fehler: Queen statt Led Zeppelin
INSERT INTO Song VALUES (409, 'Hotel California', 1976, 'Rock', 'Hotel California', 67, 6); -- Fehler: Red Hot statt Eagles
INSERT INTO Song VALUES (410, 'Wonderwall', 1995, 'Rock', '(What''s the Story)', 62, 16); -- Fehler: Arctic Monkeys statt Oasis
INSERT INTO Song VALUES (411, 'Sweet Child O'' Mine', 1987, 'Rock', 'Appetite for Destruction', 67, 11); -- Fehler: RHCP statt Guns N Roses

-- Mehr aktuelle Pop Hits
INSERT INTO Song VALUES (412, 'Dance Monkey', 2019, 'Pop', 'The Kids Are Coming', 18, 8); -- Fehler: Selena statt Tones and I
INSERT INTO Song VALUES (413, 'Stressed Out', 2015, 'Indie', 'Blurryface', 25, 15); -- Fehler: OneRepublic statt Twenty One Pilots
INSERT INTO Song VALUES (414, 'Riptide', 2013, 'Indie', 'Dream Your Life Away', 90, 6); -- Fehler: Lauv statt Vance Joy
INSERT INTO Song VALUES (415, 'Radioactive', 2012, 'Rock', 'Night Visions', 61, 8); -- Korrekt: Imagine Dragons (zweiter Eintrag)

-- Deutsche Künstler mehr Songs
INSERT INTO Song VALUES (416, 'Au Revoir', 2016, 'Pop', 'TAPE', 51, 2);
INSERT INTO Song VALUES (417, 'Geiles Leben', 2015, 'Pop', 'Guter Junge', 52, 3); -- Fehler: Max statt Glasperlenspiel
INSERT INTO Song VALUES (418, 'Barfuß am Klavier', 2017, 'Pop', 'Barfuß am Klavier', 53, 3); -- Fehler: Wincent statt AnnenMayKantereit
INSERT INTO Song VALUES (419, 'Pocahontas', 2015, 'Pop', 'Guter Junge', 56, 3); -- Fehler: Bourani statt AnnenMayKantereit

-- K-Pop weitere
INSERT INTO Song VALUES (420, 'DNA', 2017, 'K-Pop', 'Love Yourself', 98, 7);
INSERT INTO Song VALUES (421, 'Kill This Love', 2019, 'K-Pop', 'Kill This Love', 99, 12);
INSERT INTO Song VALUES (422, 'Case 143', 2022, 'K-Pop', 'MAXIDENT', 100, 10);

-- Latina/Latino weitere
INSERT INTO Song VALUES (423, 'Despechá', 2022, 'Pop', 'Motomami +', 97, 7);
INSERT INTO Song VALUES (424, 'Moscow Mule', 2022, 'Reggaeton', 'Un Verano Sin Ti', 96, 14);

-- R&B weitere
INSERT INTO Song VALUES (425, 'Snooze', 2022, 'R&B', 'SOS', 82, 14);
INSERT INTO Song VALUES (426, 'Slide', 2017, 'R&B', 'H.E.R.', 84, 14);
INSERT INTO Song VALUES (427, 'OTW', 2018, 'R&B', 'Suncity', 85, 14);

-- Country weitere
INSERT INTO Song VALUES (428, 'Thought You Should Know', 2022, 'Country', 'One Thing at a Time', 86, 10);
INSERT INTO Song VALUES (429, 'Beer Never Broke My Heart', 2019, 'Country', 'What You See Is What You Get', 87, 7);

-- Electronic weitere
INSERT INTO Song VALUES (430, 'Strobe', 2009, 'Electronic', 'For Lack of a Better Name', 75, 10); -- Fehler: Marshmello statt Deadmau5
INSERT INTO Song VALUES (431, 'Clarity', 2012, 'Electronic', 'Clarity', 72, 8); -- Fehler: Calvin statt Zedd
INSERT INTO Song VALUES (432, 'Faded', 2015, 'Electronic', 'Different World', 74, 1); -- Fehler: Avicii statt Alan Walker

-- Deutschrap weitere
INSERT INTO Song VALUES (433, 'Tamam Tamam', 2017, 'Hip Hop', 'Tamam Tamam', 38, 18);
INSERT INTO Song VALUES (434, 'Matrix', 2019, 'Hip Hop', 'Treppenhaus', 39, 19);
INSERT INTO Song VALUES (435, 'Kokain', 2016, 'Hip Hop', 'High & Hungrig 2', 40, 19);
INSERT INTO Song VALUES (436, 'Airwaves', 2017, 'Hip Hop', 'Anthrazit', 41, 19);
INSERT INTO Song VALUES (437, 'Guck wie ich Flex', 2018, 'Hip Hop', 'L.O.C.O.', 47, 10);
INSERT INTO Song VALUES (438, 'Kriminell', 2020, 'Hip Hop', 'King Lori', 48, 16);
INSERT INTO Song VALUES (439, 'Infiziert', 2019, 'Hip Hop', 'Rohdiamant', 50, 10);

-- 90er/2000er Nostalgie
INSERT INTO Song VALUES (440, 'Smells Like Teen Spirit', 1991, 'Rock', 'Nevermind', 68, 11);
INSERT INTO Song VALUES (441, '...Baby One More Time', 1998, 'Pop', 'Baby One More Time', 18, 9); -- Fehler: Selena statt Britney
INSERT INTO Song VALUES (442, 'Toxic', 2003, 'Pop', 'In the Zone', 20, 14); -- Fehler: Miley statt Britney

-- Indie weitere
INSERT INTO Song VALUES (443, 'Riptide', 2013, 'Indie', 'Dream Your Life Away', 95, 7); -- Fehler: Hozier statt Vance Joy
INSERT INTO Song VALUES (444, 'Take Me Out', 2004, 'Indie', 'Franz Ferdinand', 62, 16); -- Fehler: Arctic statt Franz Ferdinand
INSERT INTO Song VALUES (445, 'Seven Nation Army', 2003, 'Rock', 'Elephant', 63, 12); -- Fehler: Killers statt White Stripes

-- Rock Classics weitere
INSERT INTO Song VALUES (446, 'Enter Sandman', 1991, 'Rock', 'Metallica', 60, 11); -- Fehler: Linkin Park statt Metallica
INSERT INTO Song VALUES (447, 'Paranoid', 1970, 'Rock', 'Paranoid', 70, 12); -- Fehler: Queen statt Black Sabbath
INSERT INTO Song VALUES (448, 'Back in Black', 1980, 'Rock', 'Back in Black', 65, 6); -- Fehler: Green Day statt AC/DC

-- Pop aktuelle weitere
INSERT INTO Song VALUES (449, 'Espresso', 2024, 'Pop', 'Short n'' Sweet', 19, 12); -- Fehler: Camila statt Sabrina Carpenter
INSERT INTO Song VALUES (450, 'greedy', 2024, 'Pop', 'Think Later', 18, 8); -- Fehler: Selena statt Tate McRae
INSERT INTO Song VALUES (451, 'Paint The Town Red', 2023, 'Pop', 'Scarlet', 33, 14); -- Fehler: Nicki statt Doja Cat

-- Hip Hop Classic weitere
INSERT INTO Song VALUES (452, 'In Da Club', 2003, 'Hip Hop', 'Get Rich or Die Tryin''', 29, 8); -- Fehler: Eminem statt 50 Cent
INSERT INTO Song VALUES (453, 'Still D.R.E.', 1999, 'Hip Hop', '2001', 32, 11); -- Fehler: Kanye statt Dr. Dre
INSERT INTO Song VALUES (454, 'California Love', 1995, 'Hip Hop', 'All Eyez on Me', 30, 11); -- Fehler: Kendrick statt 2Pac

-- Weitere Mixed
INSERT INTO Song VALUES (455, 'Someone Like You', 2011, 'Soul', '21', 4, 2);
INSERT INTO Song VALUES (456, 'Photograph', 2014, 'Pop', 'X', 7, 3);
INSERT INTO Song VALUES (457, 'Rather Be', 2014, 'Electronic', 'If You''re Over Me', 71, 3); -- Fehler: Guetta statt Clean Bandit
INSERT INTO Song VALUES (458, 'Counting Stars', 2013, 'Pop', 'Native', 25, 8);
INSERT INTO Song VALUES (459, 'Hall of Fame', 2012, 'Pop', 'Battle Born', 63, 12); -- Fehler: Killers statt The Script
INSERT INTO Song VALUES (460, 'Viva la Vida', 2008, 'Rock', 'Viva la Vida', 9, 3);

-- Mehr von großen Artists
INSERT INTO Song VALUES (461, 'Karma', 2022, 'Pop', 'Midnights', 1, 1);
INSERT INTO Song VALUES (462, 'Is There Someone Else?', 2022, 'R&B', 'Dawn FM', 2, 1);
INSERT INTO Song VALUES (463, 'Jimmy Cooks', 2022, 'Hip Hop', 'Honestly, Nevermind', 3, 1);
INSERT INTO Song VALUES (464, 'Oh My God', 2021, 'Soul', '30', 4, 2);
INSERT INTO Song VALUES (465, 'My Eyes', 2023, 'Hip Hop', 'Utopia', 5, 2);
INSERT INTO Song VALUES (466, 'Music For a Sushi Restaurant', 2022, 'Pop', 'Harry''s House', 6, 2);
INSERT INTO Song VALUES (467, 'Eyes Closed', 2023, 'Pop', 'Subtract', 7, 3);
INSERT INTO Song VALUES (468, 'Dance The Night', 2023, 'Pop', 'Barbie Soundtrack', 8, 3);
INSERT INTO Song VALUES (469, 'feelslikeimfallinginlove', 2024, 'Rock', 'Moon Music', 9, 3);
INSERT INTO Song VALUES (470, 'LUNCH', 2024, 'Pop', 'HIT ME HARD AND SOFT', 13, 8);

-- Deutsche weitere
INSERT INTO Song VALUES (471, 'Komet', 2024, 'Pop', 'Komet', 51, 2);
INSERT INTO Song VALUES (472, 'Irgendwann ist jetzt', 2020, 'Pop', 'Irgendwann ist jetzt', 52, 3);
INSERT INTO Song VALUES (473, 'Wer wenn nicht wir', 2019, 'Pop', 'Vielleicht Irgendwann', 53, 3);
INSERT INTO Song VALUES (474, 'From Zero', 2015, 'Pop', 'Muttersprache', 54, 13);
INSERT INTO Song VALUES (475, 'Atemlos 2024', 2024, 'Schlager', 'Single', 55, 13); -- Neuauflage

-- Mehr Hip Hop
INSERT INTO Song VALUES (476, 'Chemical', 2023, 'Hip Hop', 'Austin', 28, 10);
INSERT INTO Song VALUES (477, 'Houdini', 2024, 'Hip Hop', 'The Death of Slim Shady', 29, 8);
INSERT INTO Song VALUES (478, 'United in Grief', 2022, 'Hip Hop', 'Mr. Morale', 30, 8);
INSERT INTO Song VALUES (479, 'She Knows', 2013, 'Hip Hop', 'Born Sinner', 31, 10);
INSERT INTO Song VALUES (480, 'Praise God', 2021, 'Hip Hop', 'Donda', 32, 11);

-- Latin weitere
INSERT INTO Song VALUES (481, 'Safaera', 2020, 'Reggaeton', 'YHLQMDLG', 96, 14);
INSERT INTO Song VALUES (482, 'Bizcochito', 2022, 'Pop', 'Motomami', 97, 7);

-- K-Pop weitere
INSERT INTO Song VALUES (483, 'Yet To Come', 2022, 'K-Pop', 'Proof', 98, 7);
INSERT INTO Song VALUES (484, 'Typa Girl', 2023, 'K-Pop', 'Born Pink', 99, 12);
INSERT INTO Song VALUES (485, 'S-Class', 2023, 'K-Pop', '★★★★★ (5-STAR)', 100, 10);

-- Rock weitere moderne
INSERT INTO Song VALUES (486, 'My Curse', 2006, 'Rock', 'As Daylight Dies', 60, 3); -- Fehler: Linkin Park statt Killswitch Engage
INSERT INTO Song VALUES (487, 'Do I Wanna Know?', 2013, 'Rock', 'AM', 62, 16);
INSERT INTO Song VALUES (488, 'Knights of Cydonia', 2006, 'Rock', 'Black Holes', 64, 3);

-- Electronic weitere
INSERT INTO Song VALUES (489, 'Roses', 2015, 'Electronic', 'Cloud Nine', 24, 7);
INSERT INTO Song VALUES (490, 'Something Just Like This', 2017, 'Electronic', 'Memories', 9, 7); -- Coldplay x Chainsmokers
INSERT INTO Song VALUES (491, 'Scared to Be Lonely', 2017, 'Electronic', 'Single', 73, 2);

-- Deutschrap finale
INSERT INTO Song VALUES (492, 'Berlin Berlin', 2018, 'Hip Hop', 'Berlin lebt', 38, 18);
INSERT INTO Song VALUES (493, 'Sport', 2020, 'Hip Hop', 'Gartenstadt', 39, 19);
INSERT INTO Song VALUES (494, 'Shotz Fired 2', 2021, 'Hip Hop', 'Single', 40, 19);
INSERT INTO Song VALUES (495, 'Geschichte', 2020, 'Hip Hop', 'Zenit', 41, 19);
INSERT INTO Song VALUES (496, 'Maradona', 2019, 'Hip Hop', 'L.O.C.O.', 47, 10);
INSERT INTO Song VALUES (497, 'Sonnenbrille', 2019, 'Hip Hop', 'King Lori', 48, 16);
INSERT INTO Song VALUES (498, '2 Promille', 2020, 'Hip Hop', 'Rohdiamant', 50, 10);

-- Final Songs
INSERT INTO Song VALUES (499, 'Africa', 1982, 'Rock', 'Toto IV', 9, 17); -- Fehler: Coldplay statt Toto
INSERT INTO Song VALUES (500, 'Sweet Dreams', 1983, 'Pop', 'Touch', 22, 14); -- Fehler: Lady Gaga statt Eurythmics

-- ============================================
-- ERWEITERTE USERS (40 zusätzliche = 50 total)
-- ============================================
INSERT INTO User VALUES (11, 'DJ_Markus', 'markus.berger@gmail.com', 'beats2024');
INSERT INTO User VALUES (12, 'SarahSounds', 'sarah.klein@web.de', 'music4life');
INSERT INTO User VALUES (13, 'BassHunter92', 'jan.fischer@yahoo.com', 'wubwub');
INSERT INTO User VALUES (14, 'MelodieQueen', 'julia.schmidt@gmx.de', 'singing');
INSERT INTO User VALUES (15, 'RockFan_Tim', 'tim.weber@t-online.de', 'guitar123');
INSERT INTO User VALUES (16, 'PopPrincess', 'lara.hoffmann@icloud.com', 'glitter');
INSERT INTO User VALUES (17, 'HipHopJunkie', 'kevin.meyer@outlook.com', 'rap4ever');
INSERT INTO User VALUES (18, 'IndieLover', 'nina.schulze@gmail.com', 'alternative');
INSERT INTO User VALUES (19, 'ElectroMike', 'mike.braun@web.de', 'techno');
INSERT INTO User VALUES (20, 'ClassicCarl', 'carl.richter@gmail.com', 'beethoven');
INSERT INTO User VALUES (21, 'MetalHead88', 'alex.krueger@gmx.net', 'headbang');
INSERT INTO User VALUES (22, 'JazzySarah', 'sarah.wolf@yahoo.com', 'smooth');
INSERT INTO User VALUES (23, 'DeutschrapFan', 'felix.peters@gmail.com', 'deutschrap');
INSERT INTO User VALUES (24, 'K-PopAddict', 'lisa.kim@web.de', 'kpopforever');
INSERT INTO User VALUES (25, 'CountryGirl', 'hannah.mueller@t-online.de', 'nashville');
INSERT INTO User VALUES (26, 'ReggaeVibes', 'tom.schneider@gmail.com', 'jammin');
INSERT INTO User VALUES (27, 'SoulSister', 'maria.lang@icloud.com', 'soulful');
INSERT INTO User VALUES (28, 'PartyAnimal', 'leon.bauer@outlook.com', 'party24/7');
INSERT INTO User VALUES (29, 'ChilloutZone', 'anna.walter@web.de', 'relax123');
INSERT INTO User VALUES (30, 'WorkoutWolf', 'max.zimmermann@gmail.com', 'fitness');
INSERT INTO User VALUES (31, 'StudyBeats', 'emma.krause@yahoo.com', 'study2024');
INSERT INTO User VALUES (32, 'RoadTripRalf', 'ralf.koch@gmx.de', 'highway');
INSERT INTO User VALUES (33, 'NightOwl', 'sophie.becker@gmail.com', 'midnight');
INSERT INTO User VALUES (34, 'MorningPerson', 'lukas.vogel@web.de', 'sunrise');
INSERT INTO User VALUES (35, 'RetroFan', 'christina.zimmermann@t-online.de', 'vintage');
INSERT INTO User VALUES (36, 'NewMusicNow', 'david.hartmann@icloud.com', 'fresh2024');
INSERT INTO User VALUES (37, 'Audiophile', 'michael.lehmann@gmail.com', 'hifi');
INSERT INTO User VALUES (38, 'CasualListener', 'laura.herrmann@outlook.com', 'easy');
INSERT INTO User VALUES (39, 'ConcertGoer', 'patrick.frank@web.de', 'live');
INSERT INTO User VALUES (40, 'HomeDJ', 'vanessa.martin@gmail.com', 'mixing');
INSERT INTO User VALUES (41, 'VinylCollector', 'sebastian.schroeder@yahoo.com', 'analog');
INSERT INTO User VALUES (42, 'StreamingKing', 'jonas.neumann@gmx.net', 'stream');
INSERT INTO User VALUES (43, 'PlaylistPro', 'melissa.jung@gmail.com', 'curator');
INSERT INTO User VALUES (44, 'MusicNerd', 'phillip.meyer@web.de', 'theory');
INSERT INTO User VALUES (45, 'SingAlong', 'jennifer.huber@t-online.de', 'karaoke');
INSERT INTO User VALUES (46, 'DanceFloor', 'marco.schubert@icloud.com', 'dancing');
INSERT INTO User VALUES (47, 'QuietTime', 'sabrina.kaiser@outlook.com', 'quiet');
INSERT INTO User VALUES (48, 'LoudAndProud', 'dennis.fuchs@gmail.com', 'volume11');
INSERT INTO User VALUES (49, 'GenreHopper', 'katharina.schreiber@web.de', 'everything');
INSERT INTO User VALUES (50, 'OneHitWonder', 'florian.vogel@yahoo.com', 'topcharts');

-- ============================================
-- ERWEITERTE PLAYLISTS (42 zusätzliche = 50 total)
-- ============================================
INSERT INTO Playlist VALUES (9, 'Workout Mix', '2024-01-15', 1, 11);
INSERT INTO Playlist VALUES (10, 'Chill Vibes', '2023-09-20', 1, 12);
INSERT INTO Playlist VALUES (11, 'Party Stimmung', '2023-12-28', 1, 13);
INSERT INTO Playlist VALUES (12, 'Study Session', '2024-02-01', 0, 14);
INSERT INTO Playlist VALUES (13, 'Road Trip 2024', '2024-03-15', 1, 15);
INSERT INTO Playlist VALUES (14, 'Top German Rap', '2023-11-10', 1, 23);
INSERT INTO Playlist VALUES (15, 'K-Pop Favorites', '2024-01-20', 1, 24);
INSERT INTO Playlist VALUES (16, 'Rock Legends', '2022-08-15', 1, 15);
INSERT INTO Playlist VALUES (17, 'Electronic Vibes', '2023-10-05', 1, 19);
INSERT INTO Playlist VALUES (18, 'Love Songs', '2024-02-14', 0, 2);
INSERT INTO Playlist VALUES (19, 'Morning Energy', '2024-01-01', 1, 34);
INSERT INTO Playlist VALUES (20, 'Night Drive', '2023-07-22', 1, 33);
INSERT INTO Playlist VALUES (21, '90s Nostalgie', '2023-05-10', 1, 35);
INSERT INTO Playlist VALUES (22, '2000er Hits', '2023-06-15', 1, 35);
INSERT INTO Playlist VALUES (23, 'Indie Gems', '2024-02-20', 1, 18);
INSERT INTO Playlist VALUES (24, 'Latin Heat', '2023-08-30', 1, 28);
INSERT INTO Playlist VALUES (25, 'Country Roads', '2023-09-12', 1, 25);
INSERT INTO Playlist VALUES (26, 'Soul Classics', '2023-04-18', 1, 27);
INSERT INTO Playlist VALUES (27, 'Hip Hop Essentials', '2023-03-25', 1, 17);
INSERT INTO Playlist VALUES (28, 'Pop Hits 2024', '2024-01-01', 1, 16);
INSERT INTO Playlist VALUES (29, 'Running Playlist', '2024-02-28', 1, 30);
INSERT INTO Playlist VALUES (30, 'Cooking Tunes', '2023-11-20', 0, 29);
INSERT INTO Playlist VALUES (31, 'Focus Mode', '2024-01-10', 0, 31);
INSERT INTO Playlist VALUES (32, 'Feel Good Mix', '2023-12-15', 1, 1);
INSERT INTO Playlist VALUES (33, 'Rainy Day', '2023-10-30', 0, 47);
INSERT INTO Playlist VALUES (34, 'Summer Festival', '2023-06-01', 1, 28);
INSERT INTO Playlist VALUES (35, 'Winter Chill', '2023-12-01', 1, 29);
INSERT INTO Playlist VALUES (36, 'Throwback Thursday', '2023-07-13', 1, 36);
INSERT INTO Playlist VALUES (37, 'New Discoveries', '2024-02-15', 1, 36);
INSERT INTO Playlist VALUES (38, 'Guilty Pleasures', '2023-09-05', 0, 9);
INSERT INTO Playlist VALUES (39, 'Konzert Memories', '2023-08-20', 1, 39);
INSERT INTO Playlist VALUES (40, 'DJ Set Practice', '2024-01-25', 0, 40);
INSERT INTO Playlist VALUES (41, 'Vinyl Session', '2023-10-15', 1, 41);
INSERT INTO Playlist VALUES (42, 'Top 50 Germany', '2024-02-01', 1, 50);
INSERT INTO Playlist VALUES (43, 'Schlager Party', '2023-11-11', 1, 4);
INSERT INTO Playlist VALUES (44, 'Metal Mayhem', '2023-07-07', 1, 21);
INSERT INTO Playlist VALUES (45, 'Jazz Evening', '2023-09-18', 1, 22);
INSERT INTO Playlist VALUES (46, 'Acoustic Sessions', '2023-10-22', 0, 18);
INSERT INTO Playlist VALUES (47, 'Bass Boost', '2024-01-30', 1, 13);
INSERT INTO Playlist VALUES (48, 'Karaoke Night', '2023-12-20', 1, 45);
INSERT INTO Playlist VALUES (49, 'Dance Floor Bangers', '2023-11-25', 1, 46);
INSERT INTO Playlist VALUES (50, 'Driving at Night', '2024-02-10', 1, 32);

-- ============================================
-- ERWEITERTE PLAYLISTSONGS (viele Verknüpfungen)
-- ============================================

-- Workout Mix (ID 9)
INSERT INTO PlaylistSongs VALUES (9, 61); -- Circles
INSERT INTO PlaylistSongs VALUES (9, 63); -- Rockstar
INSERT INTO PlaylistSongs VALUES (9, 71); -- HUMBLE
INSERT INTO PlaylistSongs VALUES (9, 164); -- Uptown Funk
INSERT INTO PlaylistSongs VALUES (9, 209); -- Stronger

-- Chill Vibes (ID 10)
INSERT INTO PlaylistSongs VALUES (10, 183); -- Summertime Sadness
INSERT INTO PlaylistSongs VALUES (10, 316); -- The Less I Know
INSERT INTO PlaylistSongs VALUES (10, 313); -- Heat Waves
INSERT INTO PlaylistSongs VALUES (10, 310); -- Take Me to Church
INSERT INTO PlaylistSongs VALUES (10, 128); -- The Scientist

-- Party Stimmung (ID 11)
INSERT INTO PlaylistSongs VALUES (11, 198); -- Havana
INSERT INTO PlaylistSongs VALUES (11, 205); -- Closer
INSERT INTO PlaylistSongs VALUES (11, 164); -- Uptown Funk
INSERT INTO PlaylistSongs VALUES (11, 178); -- Firework
INSERT INTO PlaylistSongs VALUES (11, 218); -- WAP

-- Study Session (ID 12)
INSERT INTO PlaylistSongs VALUES (12, 128); -- The Scientist
INSERT INTO PlaylistSongs VALUES (12, 316); -- The Less I Know
INSERT INTO PlaylistSongs VALUES (12, 145); -- Waves
INSERT INTO PlaylistSongs VALUES (12, 140); -- Wake Me Up

-- Road Trip 2024 (ID 13)
INSERT INTO PlaylistSongs VALUES (13, 14); -- As It Was
INSERT INTO PlaylistSongs VALUES (13, 16); -- Shape of You
INSERT INTO PlaylistSongs VALUES (13, 164); -- Uptown Funk
INSERT INTO PlaylistSongs VALUES (13, 271); -- Mr. Brightside
INSERT INTO PlaylistSongs VALUES (13, 106); -- 80 Millionen

-- Top German Rap (ID 14)
INSERT INTO PlaylistSongs VALUES (14, 76); -- Cherry Lady
INSERT INTO PlaylistSongs VALUES (14, 81); -- Roller
INSERT INTO PlaylistSongs VALUES (14, 86); -- Ohne mein Team
INSERT INTO PlaylistSongs VALUES (14, 98); -- Gib ihm
INSERT INTO PlaylistSongs VALUES (14, 24); -- Mein Block
INSERT INTO PlaylistSongs VALUES (14, 26); -- Haus am See

-- K-Pop Favorites (ID 15)
INSERT INTO PlaylistSongs VALUES (15, 331); -- Dynamite
INSERT INTO PlaylistSongs VALUES (15, 334); -- Pink Venom
INSERT INTO PlaylistSongs VALUES (15, 337); -- God's Menu
INSERT INTO PlaylistSongs VALUES (15, 332); -- Butter
INSERT INTO PlaylistSongs VALUES (15, 333); -- Boy With Luv

-- Rock Legends (ID 16)
INSERT INTO PlaylistSongs VALUES (16, 114); -- In The End
INSERT INTO PlaylistSongs VALUES (16, 284); -- Bohemian Rhapsody
INSERT INTO PlaylistSongs VALUES (16, 275); -- Smells Like Teen Spirit
INSERT INTO PlaylistSongs VALUES (16, 255); -- Californication
INSERT INTO PlaylistSongs VALUES (16, 279); -- Hey Jude

-- Electronic Vibes (ID 17)
INSERT INTO PlaylistSongs VALUES (17, 132); -- Titanium
INSERT INTO PlaylistSongs VALUES (17, 140); -- Wake Me Up
INSERT INTO PlaylistSongs VALUES (17, 295); -- Get Lucky
INSERT INTO PlaylistSongs VALUES (17, 136); -- Summer
INSERT INTO PlaylistSongs VALUES (17, 289); -- Animals

-- Love Songs (ID 18)
INSERT INTO PlaylistSongs VALUES (18, 9); -- Hello
INSERT INTO PlaylistSongs VALUES (18, 17); -- Perfect
INSERT INTO PlaylistSongs VALUES (18, 187); -- Stay With Me
INSERT INTO PlaylistSongs VALUES (18, 191); -- Someone You Loved
INSERT INTO PlaylistSongs VALUES (18, 165); -- Just The Way You Are

-- Morning Energy (ID 19)
INSERT INTO PlaylistSongs VALUES (19, 178); -- Firework
INSERT INTO PlaylistSongs VALUES (19, 164); -- Uptown Funk
INSERT INTO PlaylistSongs VALUES (19, 14); -- As It Was
INSERT INTO PlaylistSongs VALUES (19, 120); -- Believer

-- Night Drive (ID 20)
INSERT INTO PlaylistSongs VALUES (20, 4); -- Blinding Lights
INSERT INTO PlaylistSongs VALUES (20, 271); -- Mr. Brightside
INSERT INTO PlaylistSongs VALUES (20, 124); -- Do I Wanna Know
INSERT INTO PlaylistSongs VALUES (20, 316); -- The Less I Know

-- 90s Nostalgie (ID 21)
INSERT INTO PlaylistSongs VALUES (21, 275); -- Smells Like Teen Spirit
INSERT INTO PlaylistSongs VALUES (21, 28); -- Creep
INSERT INTO PlaylistSongs VALUES (21, 296); -- One More Time
INSERT INTO PlaylistSongs VALUES (21, 279); -- Hey Jude

-- 2000er Hits (ID 22)
INSERT INTO PlaylistSongs VALUES (22, 21); -- Yellow
INSERT INTO PlaylistSongs VALUES (22, 66); -- Lose Yourself
INSERT INTO PlaylistSongs VALUES (22, 159); -- Poker Face
INSERT INTO PlaylistSongs VALUES (22, 154); -- Umbrella

-- Indie Gems (ID 23)
INSERT INTO PlaylistSongs VALUES (23, 310); -- Take Me to Church
INSERT INTO PlaylistSongs VALUES (23, 313); -- Heat Waves
INSERT INTO PlaylistSongs VALUES (23, 183); -- Summertime Sadness
INSERT INTO PlaylistSongs VALUES (23, 397); -- Breezeblocks

-- Latin Heat (ID 24)
INSERT INTO PlaylistSongs VALUES (24, 325); -- Tití Me Preguntó
INSERT INTO PlaylistSongs VALUES (24, 328); -- MALAMENTE
INSERT INTO PlaylistSongs VALUES (24, 198); -- Havana

-- Country Roads (ID 25)
INSERT INTO PlaylistSongs VALUES (25, 319); -- Last Night
INSERT INTO PlaylistSongs VALUES (25, 322); -- Fast Car
INSERT INTO PlaylistSongs VALUES (25, 153); -- TEXAS HOLD 'EM

-- Hip Hop Essentials (ID 27)
INSERT INTO PlaylistSongs VALUES (27, 66); -- Lose Yourself
INSERT INTO PlaylistSongs VALUES (27, 71); -- HUMBLE
INSERT INTO PlaylistSongs VALUES (27, 7); -- Gods Plan
INSERT INTO PlaylistSongs VALUES (27, 222); -- No Role Modelz
INSERT INTO PlaylistSongs VALUES (27, 216); -- Bodak Yellow

-- Pop Hits 2024 (ID 28)
INSERT INTO PlaylistSongs VALUES (28, 2); -- Anti-Hero
INSERT INTO PlaylistSongs VALUES (28, 54); -- vampire
INSERT INTO PlaylistSongs VALUES (28, 202); -- Flowers
INSERT INTO PlaylistSongs VALUES (28, 39); -- What Was I Made For
INSERT INTO PlaylistSongs VALUES (28, 31); -- Houdini

-- Running Playlist (ID 29)
INSERT INTO PlaylistSongs VALUES (29, 120); -- Believer
INSERT INTO PlaylistSongs VALUES (29, 12); -- SICKO MODE
INSERT INTO PlaylistSongs VALUES (29, 63); -- Rockstar
INSERT INTO PlaylistSongs VALUES (29, 71); -- HUMBLE

-- Top 50 Germany (ID 42)
INSERT INTO PlaylistSongs VALUES (42, 2); -- Anti-Hero
INSERT INTO PlaylistSongs VALUES (42, 81); -- Roller
INSERT INTO PlaylistSongs VALUES (42, 102); -- Chöre
INSERT INTO PlaylistSongs VALUES (42, 106); -- 80 Millionen
INSERT INTO PlaylistSongs VALUES (42, 386); -- Atemlos

-- Schlager Party (ID 43)
INSERT INTO PlaylistSongs VALUES (43, 386); -- Atemlos
INSERT INTO PlaylistSongs VALUES (43, 387); -- Herzbeben
INSERT INTO PlaylistSongs VALUES (43, 240); -- Wie schön du bist

-- Driving at Night (ID 50)
INSERT INTO PlaylistSongs VALUES (50, 4); -- Blinding Lights
INSERT INTO PlaylistSongs VALUES (50, 124); -- Do I Wanna Know
INSERT INTO PlaylistSongs VALUES (50, 345); -- Cant Feel My Face

-- ============================================
-- ERWEITERTE USERLIKES (viele Verknüpfungen)
-- ============================================

-- User 11 mag Electronic
INSERT INTO UserLikes VALUES (11, 132);
INSERT INTO UserLikes VALUES (11, 140);
INSERT INTO UserLikes VALUES (11, 295);
INSERT INTO UserLikes VALUES (11, 136);

-- User 12 mag Pop
INSERT INTO UserLikes VALUES (12, 1);
INSERT INTO UserLikes VALUES (12, 41);
INSERT INTO UserLikes VALUES (12, 52);

-- User 15 mag Rock
INSERT INTO UserLikes VALUES (15, 114);
INSERT INTO UserLikes VALUES (15, 284);
INSERT INTO UserLikes VALUES (15, 275);

-- User 16 mag Pop
INSERT INTO UserLikes VALUES (16, 2);
INSERT INTO UserLikes VALUES (16, 14);
INSERT INTO UserLikes VALUES (16, 54);

-- User 17 mag Hip Hop
INSERT INTO UserLikes VALUES (17, 66);
INSERT INTO UserLikes VALUES (17, 71);
INSERT INTO UserLikes VALUES (17, 216);

-- User 23 mag Deutschrap
INSERT INTO UserLikes VALUES (23, 76);
INSERT INTO UserLikes VALUES (23, 81);
INSERT INTO UserLikes VALUES (23, 24);
INSERT INTO UserLikes VALUES (23, 26);
INSERT INTO UserLikes VALUES (23, 98);

-- User 24 mag K-Pop
INSERT INTO UserLikes VALUES (24, 331);
INSERT INTO UserLikes VALUES (24, 334);
INSERT INTO UserLikes VALUES (24, 337);

-- User 28 mag alles Mögliche
INSERT INTO UserLikes VALUES (28, 164);
INSERT INTO UserLikes VALUES (28, 198);
INSERT INTO UserLikes VALUES (28, 218);

-- ============================================
-- ERWEITERTE USERFOLLOWS (viele Verknüpfungen)
-- ============================================

-- User 11 folgt Electronic Artists
INSERT INTO UserFollows VALUES (11, 71);
INSERT INTO UserFollows VALUES (11, 72);
INSERT INTO UserFollows VALUES (11, 74);

-- User 12 folgt Pop Artists
INSERT INTO UserFollows VALUES (12, 1);
INSERT INTO UserFollows VALUES (12, 14);
INSERT INTO UserFollows VALUES (12, 7);

-- User 15 folgt Rock Artists
INSERT INTO UserFollows VALUES (15, 60);
INSERT INTO UserFollows VALUES (15, 70);
INSERT INTO UserFollows VALUES (15, 68);

-- User 16 folgt Pop Artists
INSERT INTO UserFollows VALUES (16, 1);
INSERT INTO UserFollows VALUES (16, 16);
INSERT INTO UserFollows VALUES (16, 8);

-- User 17 folgt Hip Hop Artists
INSERT INTO UserFollows VALUES (17, 29);
INSERT INTO UserFollows VALUES (17, 30);
INSERT INTO UserFollows VALUES (17, 3);

-- User 23 folgt Deutschrap
INSERT INTO UserFollows VALUES (23, 38);
INSERT INTO UserFollows VALUES (23, 39);
INSERT INTO UserFollows VALUES (23, 10);
INSERT INTO UserFollows VALUES (23, 11);
INSERT INTO UserFollows VALUES (23, 49);

-- User 24 folgt K-Pop
INSERT INTO UserFollows VALUES (24, 98);
INSERT INTO UserFollows VALUES (24, 99);
INSERT INTO UserFollows VALUES (24, 100);
    `;
    this.db.run(sql);
  }

  
  executeQuery(query: string): any {
    if (!this.db) return null;
    try {
      const res = this.db.exec(query);
      if (res.length === 0) return { columns: [], values: [] };
      return { columns: res[0].columns, values: res[0].values, error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  }
}